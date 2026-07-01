"use client";

import { useCallback, useState } from "react";

export type TestStatus =
  | "idle"
  | "testing-latency"
  | "testing-download"
  | "testing-upload"
  | "done"
  | "error";

export interface SpeedTestResult {
  latency: number | null; // ms
  download: number | null; // Mbps
  upload: number | null; // Mbps
  status: "OPERATIONAL" | "DEGRADED" | "DISCONNECTED";
  statusMessage: string;
  testedAt: string | null;
}

const LATENCY_SAMPLES = 5;
const UPLOAD_SIZE = 3 * 1024 * 1024; // 3MB upload blob

async function measureLatency(): Promise<number> {
  const samples: number[] = [];
  for (let i = 0; i < LATENCY_SAMPLES; i++) {
    const start = performance.now();
    await fetch("/api/speedtest/latency", { cache: "no-store" });
    samples.push(performance.now() - start);
  }
  // Return median to filter outliers.
  samples.sort((a, b) => a - b);
  return Math.round(samples[Math.floor(samples.length / 2)]);
}

async function measureDownload(): Promise<number> {
  const start = performance.now();
  const res = await fetch("/api/speedtest/download", { cache: "no-store" });
  const buffer = await res.arrayBuffer();
  const durationSeconds = (performance.now() - start) / 1000;
  const bytes = buffer.byteLength;
  return parseFloat(((bytes * 8) / durationSeconds / 1_000_000).toFixed(1));
}

async function measureUpload(): Promise<number> {
  const blob = new Blob([new ArrayBuffer(UPLOAD_SIZE)]);
  const start = performance.now();
  await fetch("/api/speedtest/upload", {
    method: "POST",
    body: blob,
    cache: "no-store",
  });
  const durationSeconds = (performance.now() - start) / 1000;
  return parseFloat(
    ((UPLOAD_SIZE * 8) / durationSeconds / 1_000_000).toFixed(1),
  );
}

function deriveStatus(
  latency: number | null,
  download: number | null,
): SpeedTestResult["status"] {
  if (latency === null || download === null) return "DISCONNECTED";
  if (latency > 200 || download < 1) return "DEGRADED";
  return "OPERATIONAL";
}

function deriveStatusMessage(
  status: SpeedTestResult["status"],
  latency: number | null,
): string {
  if (status === "DISCONNECTED") {
    return "Internet connection could not be reached.";
  }
  if (status === "DEGRADED") {
    return `High latency (${latency}ms) or low throughput detected. Network may be congested.`;
  }
  return `Gateway reports optimal handshake protocols. Latency ${latency}ms.`;
}

const IDLE_RESULT: SpeedTestResult = {
  latency: null,
  download: null,
  upload: null,
  status: "OPERATIONAL",
  statusMessage: "Run a scan to check real internet speed.",
  testedAt: null,
};

export function useSpeedTest() {
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [result, setResult] = useState<SpeedTestResult>(IDLE_RESULT);

  const runTest = useCallback(async () => {
    setTestStatus("testing-latency");
    setResult((previous) => ({
      ...previous,
      latency: null,
      download: null,
      upload: null,
    }));

    try {
      const latency = await measureLatency();
      setResult((previous) => ({ ...previous, latency }));

      setTestStatus("testing-download");
      const download = await measureDownload();
      setResult((previous) => ({ ...previous, download }));

      setTestStatus("testing-upload");
      const upload = await measureUpload();

      const status = deriveStatus(latency, download);
      const statusMessage = deriveStatusMessage(status, latency);

      setResult({
        latency,
        download,
        upload,
        status,
        statusMessage,
        testedAt: new Date().toISOString(),
      });
      setTestStatus("done");
    } catch (error) {
      console.error("Speed test failed", error);
      setResult({
        latency: null,
        download: null,
        upload: null,
        status: "DISCONNECTED",
        statusMessage: "Connection test failed. Internet may be unavailable.",
        testedAt: new Date().toISOString(),
      });
      setTestStatus("error");
    }
  }, []);

  return { result, testStatus, runTest };
}
