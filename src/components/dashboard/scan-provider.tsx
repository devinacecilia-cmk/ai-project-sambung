"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  PingAllResponse,
  ServiceLogEntry,
  ServiceResult,
} from "@/app/api/ping-all/route";
import { saveSnapshot } from "@/lib/diagnostics-store";

const SCAN_INTERVAL_MS = 30_000;
const ACTIVITY_FEED_LIMIT = 20;

interface ScanContextValue {
  services: ServiceResult[];
  activityFeed: ServiceLogEntry[];
  lastScan: string | null;
  isScanning: boolean;
  triggerScan: () => void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

// Owns the /api/ping-all scan cycle so the sidebar/navbar and any dashboard
// page can trigger a scan and read the same live results instead of each
// page running its own independent poll.
export function ScanProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ServiceResult[]>([]);
  const [activityFeed, setActivityFeed] = useState<ServiceLogEntry[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const runningRef = useRef(false);

  async function runScan() {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsScanning(true);
    try {
      const res = await fetch("/api/ping-all");
      const data: PingAllResponse = await res.json();
      setServices(data.results);
      setLastScan(data.scannedAt);
      setActivityFeed((previous) =>
        [...data.results.map((result) => result.logEntry), ...previous].slice(
          0,
          ACTIVITY_FEED_LIMIT,
        ),
      );
      saveSnapshot({
        services: data.results.map((result) => ({
          name: result.name,
          ip: result.ip,
          status: result.status,
          latency: result.latency,
        })),
        scannedAt: data.scannedAt,
      });
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      runningRef.current = false;
      setIsScanning(false);
    }
  }

  useEffect(() => {
    runScan();
    const interval = setInterval(runScan, SCAN_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScanContext.Provider
      value={{ services, activityFeed, lastScan, isScanning, triggerScan: runScan }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan(): ScanContextValue {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
}
