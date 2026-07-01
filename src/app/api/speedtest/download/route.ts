import { NextResponse } from "next/server";

// Vercel Serverless Functions cap response bodies around 4.5MB, so this
// stays well under that regardless of where the app is deployed.
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

export async function GET() {
  const buffer = Buffer.alloc(CHUNK_SIZE, "x");
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(CHUNK_SIZE),
      "Cache-Control": "no-store, no-cache",
    },
  });
}
