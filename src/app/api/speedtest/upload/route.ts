import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Drain the body and discard it.
  await req.arrayBuffer();
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, no-cache" } },
  );
}
