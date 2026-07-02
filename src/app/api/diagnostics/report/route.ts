import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import type { DiagnosticsSnapshot } from "@/lib/diagnostics-store";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash";

function buildPrompt(snapshot: DiagnosticsSnapshot): string {
  const failedServices = snapshot.services.filter(
    (s) => s.status !== "CONNECTED",
  );

  return `You are a network diagnostics assistant. Write a comprehensive, plain-English diagnostic report from the network scan data below. Cover: overall status, the most likely root cause if anything is degraded or down, and what the numbers actually indicate. Write 3-5 short paragraphs. No markdown headers, no bullet lists, no code blocks.

Some services include a "note" field with operator-supplied context (e.g. "Requires VPN"). Treat notes as authoritative for root cause — if a failed service has a note, explain the failure using that note instead of guessing at generic causes like firewall or routing issues.

Scan data (JSON):
${JSON.stringify(snapshot, null, 2)}

Failed or degraded services: ${
    failedServices.length === 0
      ? "none"
      : failedServices
          .map(
            (s) =>
              `${s.name} (${s.status})${s.note ? ` — note: ${s.note}` : ""}`,
          )
          .join(", ")
  }`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const snapshot = (await request.json()) as DiagnosticsSnapshot;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(snapshot),
    });

    const report = response.text?.trim();
    if (!report) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 502 },
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Gemini diagnostics report failed", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 502 },
    );
  }
}
