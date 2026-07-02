import { NextResponse } from "next/server";

import { tcpPing, type PingStatus } from "@/lib/tcp-ping";

export const runtime = "nodejs";

interface MonitoredService {
  name: string;
  host: string;
  port: number;
  note?: string;
}

// Fallback used only if PING_SERVICES isn't set (e.g. .env.local missing).
// `host` accepts either an IP literal or an FQDN — tcpPing resolves DNS
// automatically. Configure the real list via PING_SERVICES so internal
// hostnames don't need to live in committed source.
const DEFAULT_SERVICES: MonitoredService[] = [
  { name: "Google Public DNS", host: "dns.google", port: 53 },
  { name: "Cloudflare", host: "one.one.one.one", port: 53 },
  { name: "Quad9", host: "dns.quad9.net", port: 53 },
  { name: "OpenDNS", host: "resolver1.opendns.com", port: 53 },
  { name: "AdGuard DNS", host: "dns.adguard.com", port: 53 },
];

// Reads PING_1_NAME/PING_1_HOST/PING_1_PORT, PING_2_NAME/..., etc. from env,
// stopping at the first missing index. Falls back to DEFAULT_SERVICES if
// none are set. PING_{i}_NOTE is optional free text (e.g. "Requires VPN")
// surfaced to the AI diagnostic report so it can explain host-specific
// failures instead of guessing at generic causes.
function loadServices(): MonitoredService[] {
  const services: MonitoredService[] = [];

  for (let i = 1; ; i++) {
    const name = process.env[`PING_${i}_NAME`];
    const host = process.env[`PING_${i}_HOST`];
    const port = process.env[`PING_${i}_PORT`];
    if (!name || !host || !port) break;

    const portNumber = Number(port);
    if (Number.isNaN(portNumber)) {
      console.error(`Invalid PING_${i}_PORT env var "${port}", skipping`);
      continue;
    }
    const note = process.env[`PING_${i}_NOTE`];
    services.push({ name, host, port: portNumber, note: note || undefined });
  }

  return services.length > 0 ? services : DEFAULT_SERVICES;
}

const SERVICES = loadServices();

export interface ServiceLogEntry {
  time: string;
  message: string;
  level: "OK" | "CRIT";
}

export interface ServiceResult {
  name: string;
  host: string;
  status: PingStatus;
  latency: number | null;
  checkedAt: string;
  logEntry: ServiceLogEntry;
  note?: string;
}

export interface PingAllResponse {
  results: ServiceResult[];
  scannedAt: string;
}

export async function GET() {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  const results = await Promise.all(
    SERVICES.map(async (service): Promise<ServiceResult> => {
      const { status, latency } = await tcpPing(service.host, service.port);

      return {
        name: service.name,
        host: service.host,
        status,
        latency,
        checkedAt: now.toISOString(),
        note: service.note,
        logEntry: {
          time: timeStr,
          message:
            status === "CONNECTED"
              ? `PING: ${service.name} (${service.host}) - REACHABLE [${latency}ms]`
              : `ERR: ${service.name} (${service.host}) - ${status}`,
          level: status === "CONNECTED" ? "OK" : "CRIT",
        },
      };
    }),
  );

  const response: PingAllResponse = {
    results,
    scannedAt: now.toISOString(),
  };

  return NextResponse.json(response);
}
