"use client";

import type { ComponentType } from "react";
import {
  AlertTriangle,
  Brain,
  Database,
  Plug,
  ShieldCheck,
} from "lucide-react";

import { GLASS_CARD } from "@/components/dashboard/glass-card";

const ACTION_STEPS = [
  {
    title: "Validate Internal Connectivity",
    description:
      "Attempt to access the 'Central Auth' or 'Internal Portal' to confirm your VPN and local gateway are active.",
  },
  {
    title: "Observe Wait Threshold",
    description:
      "Auto-recovery protocols are currently engaged. Please wait 5 minutes before attempting a manual hard-refresh.",
  },
  {
    title: "Escalate if Unresolved",
    description:
      "If the status does not transition after 10 minutes, use the 'Report Issue' button to notify the SRE on-call team.",
  },
];

const UPTIME_BARS: { height: number; className: string }[] = [
  { height: 100, className: "bg-[#adc6ff]/40" },
  { height: 98, className: "bg-[#adc6ff]/40" },
  { height: 99, className: "bg-[#adc6ff]/40" },
  { height: 100, className: "bg-[#adc6ff]/40" },
  { height: 20, className: "bg-[#ffb4ab]/40" },
  { height: 10, className: "animate-pulse bg-[#ffb4ab]" },
  { height: 5, className: "bg-[#ffb4ab]/40" },
  { height: 2, className: "bg-[#ffb4ab]/20" },
];

const DEPENDENCIES: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  status: string;
  tone: "success" | "error";
}[] = [
  {
    icon: ShieldCheck,
    label: "Identity Auth",
    status: "CONNECTED",
    tone: "success",
  },
  {
    icon: Database,
    label: "Central Database",
    status: "CONNECTED",
    tone: "success",
  },
  { icon: Plug, label: "GL Middleware", status: "FAILED", tone: "error" },
];

export default function DiagnosticDetailPage() {
  return (
    <>
      {/* Hero Status */}
      <section
        className={`${GLASS_CARD} relative overflow-hidden rounded-2xl p-8 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]`}
      >
        <div className="pointer-events-none absolute top-0 right-0 p-6 opacity-10">
          <AlertTriangle className="size-32" />
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="status-pulse-ring size-3 rounded-full bg-[#ffb4ab]" />
              <span className="text-xs font-semibold tracking-widest text-[#ffb4ab] uppercase">
                System Outage Detected
              </span>
            </div>
            <h1 className="mb-1 text-4xl font-bold tracking-tight text-[#dae2fd] sm:text-5xl">
              GL System - Not Reachable
            </h1>
            <p className="max-w-2xl text-lg text-[#c2c6d6]">
              Connection timeout after{" "}
              <span className="font-bold text-[#ffb4ab]">5000ms</span>. The
              target endpoint failed to respond within the expected
              threshold.
            </p>
          </div>
          <div
            className={`${GLASS_CARD} rounded-xl border-white/5 bg-[#171f33]/20 p-4 text-right`}
          >
            <p className="mb-1 text-xs tracking-wider text-[#c2c6d6] uppercase">
              Last Healthy Timestamp
            </p>
            <p className="text-lg font-bold text-[#adc6ff]">
              2026-07-01 14:32:01 UTC
            </p>
            <p className="mt-1 text-sm text-[#c2c6d6]">12m 45s ago</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* Diagnosis Engine */}
          <section
            className={`${GLASS_CARD} relative overflow-hidden rounded-2xl border-l-4 border-[#adc6ff] p-6`}
          >
            <div className="pointer-events-none absolute top-0 right-0 p-6 opacity-5">
              <Brain className="size-24" />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <Brain className="size-8 text-[#adc6ff]" />
              <h2 className="text-xl font-semibold text-[#dae2fd]">
                Diagnosis Engine Interpretation
              </h2>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#222a3d]/30 p-4 backdrop-blur-md">
              <p className="leading-relaxed text-[#dae2fd]">
                The internal API for the{" "}
                <span className="font-bold text-[#adc6ff]">
                  General Ledger (GL)
                </span>{" "}
                system is currently unavailable. Primary telemetry indicates
                this is a{" "}
                <span className="text-[#c2c6d6] italic">
                  server-side synchronization failure
                </span>{" "}
                originating from the Frankfurt data center cluster.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#c0c1ff]/10 bg-[#3131c0]/20 px-4 py-2">
                <span className="text-xs font-bold tracking-widest text-[#c0c1ff] uppercase">
                  Logic Insight
                </span>
                <p className="text-[#dae2fd]">
                  This is likely a widespread system event and not specific to
                  your local network.
                </p>
              </div>
            </div>
          </section>

          {/* Action Plan */}
          <section className={`${GLASS_CARD} rounded-2xl p-6`}>
            <h2 className="mb-6 text-xl font-semibold text-[#dae2fd]">
              Recommended Action Plan
            </h2>
            <div className="space-y-4">
              {ACTION_STEPS.map(({ title, description }, index) => (
                <div className="group flex items-start gap-4" key={title}>
                  <div
                    className={`${GLASS_CARD} flex size-10 shrink-0 items-center justify-center rounded-xl font-bold text-[#adc6ff] group-hover:bg-[#adc6ff] group-hover:text-[#00285d]`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-xl p-4 transition-colors hover:bg-white/5">
                    <h3 className="text-lg font-semibold text-[#dae2fd]">
                      {title}
                    </h3>
                    <p className="mt-1 text-[#c2c6d6]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-4">
          {/* System Identity */}
          <section className={`${GLASS_CARD} overflow-hidden rounded-2xl`}>
            <div className="border-b border-white/5 bg-white/5 px-4 py-3">
              <h2 className="text-xs font-semibold tracking-widest text-[#c2c6d6] uppercase">
                System Identity
              </h2>
            </div>
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between border-b border-white/5 py-2">
                <span className="text-sm text-[#c2c6d6]">Environment</span>
                <span className="rounded border border-[#ffb786] bg-[#ffb786]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#ffb786] uppercase">
                  Production
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-2">
                <span className="text-sm text-[#c2c6d6]">Protocol</span>
                <span className="text-xs font-semibold text-[#dae2fd]">
                  HTTPS / REST v3.2
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-2">
                <span className="text-sm text-[#c2c6d6]">Region</span>
                <span className="text-xs font-semibold text-[#dae2fd]">
                  EU-CENTRAL-1 (FRA)
                </span>
              </div>
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-[#c2c6d6]">24h Uptime</span>
                  <span className="text-xs font-bold text-[#adc6ff]">
                    99.2%
                  </span>
                </div>
                <div className="flex h-12 w-full items-end gap-0.5">
                  {UPTIME_BARS.map(({ height, className }, index) => (
                    <div
                      className={`flex-1 rounded-t-sm ${className}`}
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Active Dependencies */}
          <section className={`${GLASS_CARD} overflow-hidden rounded-2xl`}>
            <div className="border-b border-white/5 bg-white/5 px-4 py-3">
              <h2 className="text-xs font-semibold tracking-widest text-[#c2c6d6] uppercase">
                Active Dependencies
              </h2>
            </div>
            <div className="space-y-2 p-4">
              {DEPENDENCIES.map(({ icon: Icon, label, status, tone }) => (
                <div
                  className={`flex items-center justify-between rounded-xl border p-2 transition-all ${
                    tone === "error"
                      ? "border-[#ffb4ab]/20 bg-[#93000a]/10 hover:bg-[#93000a]/20"
                      : "border-white/5 bg-[#171f33]/20 hover:bg-white/5"
                  }`}
                  key={label}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`size-5 ${
                        tone === "error"
                          ? "text-[#ffb4ab]"
                          : "text-[#adc6ff]"
                      }`}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold ${
                      tone === "error" ? "text-[#ffb4ab]" : "text-[#adc6ff]"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        tone === "error"
                          ? "animate-pulse bg-[#ffb4ab]"
                          : "bg-[#adc6ff]"
                      }`}
                    />
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
