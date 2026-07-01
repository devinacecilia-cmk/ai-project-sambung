import { NextResponse } from "next/server";

import { tcpPing, type PingStatus } from "@/lib/tcp-ping";

export const runtime = "nodejs";

// Swap this list for your internal hostnames/IPs and their appropriate
// ports (e.g. 80, 443, 8080) once monitoring real systems.
const SERVICES = [
  { name: "Google Public DNS", ip: "8.8.8.8", port: 53 },
  { name: "Cloudflare", ip: "1.1.1.1", port: 53 },
  { name: "Quad9", ip: "9.9.9.9", port: 53 },
  { name: "OpenDNS", ip: "208.67.222.222", port: 53 /* 443 */ },
  { name: "AdGuard DNS", ip: "94.140.14.14", port: 53 },
];

export interface ServiceLogEntry {
  time: string;
  message: string;
  level: "OK" | "CRIT";
}

export interface ServiceResult {
  name: string;
  ip: string;
  status: PingStatus;
  latency: number | null;
  checkedAt: string;
  logEntry: ServiceLogEntry;
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
      const { status, latency } = await tcpPing(service.ip, service.port);

      return {
        name: service.name,
        ip: service.ip,
        status,
        latency,
        checkedAt: now.toISOString(),
        logEntry: {
          time: timeStr,
          message:
            status === "CONNECTED"
              ? `PING: ${service.name} (${service.ip}) - REACHABLE [${latency}ms]`
              : `ERR: ${service.name} (${service.ip}) - ${status}`,
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
