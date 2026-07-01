import { NextResponse, type NextRequest } from "next/server";

import { tcpPing, type PingStatus } from "@/lib/tcp-ping";

export const runtime = "nodejs";

export interface PingResult {
  host: string;
  port: number;
  status: PingStatus;
  latency: number | null;
  checkedAt: string;
}

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host");
  const port = parseInt(req.nextUrl.searchParams.get("port") ?? "80");

  if (!host) {
    return NextResponse.json(
      { error: "host query param is required" },
      { status: 400 },
    );
  }

  const { status, latency } = await tcpPing(host, port);

  const result: PingResult = {
    host,
    port,
    status,
    latency,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
