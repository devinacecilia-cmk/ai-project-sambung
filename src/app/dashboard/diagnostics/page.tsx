"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { AlertTriangle, Brain, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { GLASS_CARD } from "@/components/dashboard/glass-card";
import {
  loadSnapshot,
  type DiagnosticsSnapshot,
  type NetworkStatus,
  type SnapshotService,
} from "@/lib/diagnostics-store";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getServiceIcon, toneForServiceStatus } from "@/lib/service-display";

const REGION = process.env.NEXT_PUBLIC_REGION ?? "JAKARTA / ID";
const SNAPSHOT_POLL_MS = 5000;

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

type BannerTone = "success" | "warning" | "error" | "neutral";

const BANNER_STYLES: Record<
  BannerTone,
  {
    dot: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    glow: string;
  }
> = {
  success: {
    dot: "bg-emerald-400",
    label: "text-emerald-400",
    icon: CheckCircle2,
    glow: "shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]",
  },
  warning: {
    dot: "bg-amber-400",
    label: "text-amber-400",
    icon: AlertTriangle,
    glow: "shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]",
  },
  error: {
    dot: "bg-[#ffb4ab]",
    label: "text-[#ffb4ab]",
    icon: AlertTriangle,
    glow: "shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]",
  },
  neutral: {
    dot: "bg-[#8c909f]",
    label: "text-[#c2c6d6]",
    icon: AlertTriangle,
    glow: "",
  },
};

const BANNER_LABELS: Record<BannerTone, string> = {
  success: "All Systems Operational",
  warning: "Degraded Performance Detected",
  error: "System Outage Detected",
  neutral: "No Scan Data",
};

const ACTION_STEPS_BY_STATUS: Record<
  NetworkStatus,
  { title: string; description: string }[]
> = {
  OPERATIONAL: [
    {
      title: "Continue Routine Monitoring",
      description:
        "No issues detected. Scans continue automatically every 30 seconds from the Dashboard.",
    },
    {
      title: "Review Historical Trends",
      description:
        "Check the System History page periodically to spot recurring patterns before they become incidents.",
    },
    {
      title: "Schedule Preventive Maintenance",
      description:
        "Use quiet periods to apply pending updates or hardware checks without risking active traffic.",
    },
  ],
  DEGRADED: [
    {
      title: "Check Wifi Signal Strength",
      description:
        "Move closer to the access point or switch to a 5GHz band if available to reduce interference.",
    },
    {
      title: "Restart Local Router",
      description:
        "Power cycle your router and modem, waiting 30 seconds before reconnecting.",
    },
    {
      title: "Review VPN Connection",
      description:
        "If a VPN is active, try disconnecting it temporarily to see if throughput improves.",
    },
  ],
  DISCONNECTED: [
    {
      title: "Verify Physical Connection",
      description:
        "Confirm ethernet cables are seated and any wifi adapter is enabled.",
    },
    {
      title: "Restart Router & Modem",
      description:
        "Power cycle both devices in order: modem first, then router, waiting 30 seconds between each.",
    },
    {
      title: "Contact Your ISP",
      description:
        "If the outage persists after restarting hardware, contact your Internet Service Provider to check for a wider outage.",
    },
  ],
};

const PLACEHOLDER_ACTION_STEP = {
  title: "Run Your First Scan",
  description:
    "Head to the Dashboard and let a scan complete once to populate live diagnostics here.",
};

// The speed test and the ping-all scan can disagree (e.g. localhost speed
// test looks great while a couple of DNS resolvers time out), so every
// section derives its severity from this combined status instead of the
// speed test's networkStatus alone.
function getEffectiveStatus(
  snap: DiagnosticsSnapshot,
  failedCount: number,
): NetworkStatus {
  if (snap.networkStatus === "DISCONNECTED") return "DISCONNECTED";
  if (snap.networkStatus === "DEGRADED" || failedCount > 0) return "DEGRADED";
  return "OPERATIONAL";
}

function getBannerTone(
  snap: DiagnosticsSnapshot | null,
  effectiveStatus: NetworkStatus,
): BannerTone {
  if (!snap || !snap.scannedAt) return "neutral";
  if (effectiveStatus === "DISCONNECTED") return "error";
  if (effectiveStatus === "DEGRADED") return "warning";
  return "success";
}

function getBannerTitle(
  tone: BannerTone,
  criticalService: SnapshotService | null,
): string {
  if (tone === "neutral") return "No Scan Data Yet";
  if (tone === "success") return "Network Healthy";
  const name = criticalService?.name ?? "Internet";
  const word =
    criticalService?.status === "TIMEOUT"
      ? "Connection Timeout"
      : criticalService?.status === "ERROR"
        ? "Not Reachable"
        : "Unreachable";
  return `${name} - ${word}`;
}

function getBannerDescription(
  tone: BannerTone,
  snap: DiagnosticsSnapshot | null,
): ReactNode {
  if (tone === "neutral") {
    return "Run a scan from the Dashboard to see live diagnostics.";
  }
  if (tone === "error") {
    return (
      <>
        Connection timeout after{" "}
        <span className="font-bold text-[#ffb4ab]">
          {snap?.latency ?? "N/A"}ms
        </span>
        . The target endpoint failed to respond within the expected threshold.
      </>
    );
  }
  if (tone === "warning") {
    return "Elevated latency or unreachable endpoints detected. Some services may be degraded.";
  }
  return "All monitored endpoints are reachable and responding within normal thresholds.";
}

function getDiagnosisText(
  snap: DiagnosticsSnapshot,
  failedServices: SnapshotService[],
): string {
  if (snap.networkStatus === "DISCONNECTED") {
    return "Internet connectivity could not be established. All external endpoints are unreachable. Local network or ISP may be down.";
  }
  if (failedServices.length > 0) {
    return `The following endpoints are unreachable: ${failedServices
      .map((s) => s.name)
      .join(
        ", ",
      )}. This may indicate DNS resolution issues or firewall blocking.`;
  }
  return `All monitored endpoints are reachable. Network performance is within normal thresholds. Latency: ${snap.latency ?? "N/A"}ms, Download: ${snap.download ?? "N/A"} Mbps.`;
}

function getLogicInsight(
  snap: DiagnosticsSnapshot,
  effectiveStatus: NetworkStatus,
  failedServices: SnapshotService[],
): string {
  if (effectiveStatus === "DISCONNECTED") {
    return "No internet connection. Verify physical network connection and router status.";
  }
  if (effectiveStatus === "DEGRADED") {
    if (snap.networkStatus === "DEGRADED") {
      return `High latency (${snap.latency ?? "N/A"}ms) detected. Check wifi signal strength or VPN connection.`;
    }
    return `${failedServices.length} monitored endpoint${failedServices.length === 1 ? "" : "s"} unreachable. This may be isolated to those services rather than your local connection.`;
  }
  return "All systems normal. No action required.";
}

function formatUtcTimestamp(iso: string): string {
  return `${iso.slice(0, 19).replace("T", " ")} UTC`;
}

function computeUptimePercent(
  snap: DiagnosticsSnapshot | null,
  effectiveStatus: NetworkStatus,
): string {
  if (!snap || !snap.scannedAt) return "—";
  if (effectiveStatus === "OPERATIONAL") return "100.0";
  if (!snap.lastHealthyAt) return "0.0";
  const downtimeMs = Math.max(
    0,
    Date.now() - new Date(snap.lastHealthyAt).getTime(),
  );
  const dayMs = 24 * 60 * 60 * 1000;
  const pct = Math.max(0, (1 - Math.min(downtimeMs, dayMs) / dayMs) * 100);
  return pct.toFixed(1);
}

export default function DiagnosticDetailPage() {
  const [snap, setSnap] = useState<DiagnosticsSnapshot | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportScannedAt, setAiReportScannedAt] = useState<string | null>(
    null,
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    // Reads localStorage, so this must stay in an effect: doing it during
    // render would mismatch between server and client output.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnap(loadSnapshot());
    const poll = setInterval(() => setSnap(loadSnapshot()), SNAPSHOT_POLL_MS);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  async function handleGenerateAiReport() {
    if (!snap) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/diagnostics/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snap),
      });
      const data = (await res.json()) as { report?: string; error?: string };
      if (!res.ok || !data.report) {
        throw new Error(data.error ?? "Failed to generate report");
      }
      setAiReport(data.report);
      setAiReportScannedAt(snap.scannedAt);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Failed to generate report",
      );
    } finally {
      setAiLoading(false);
    }
  }

  // Once generated, the report stays visible until regenerated — the
  // dashboard's background auto-scan (every 30s) would otherwise silently
  // hide it seconds after the user clicked to generate it. We flag it as
  // stale instead so the user can judge whether to regenerate.
  const aiReportIsStale = Boolean(
    aiReport && aiReportScannedAt !== snap?.scannedAt,
  );

  const failedServices =
    snap?.services.filter((s) => s.status !== "CONNECTED") ?? [];
  const criticalService = failedServices[0] ?? null;
  const effectiveStatus = snap
    ? getEffectiveStatus(snap, failedServices.length)
    : "OPERATIONAL";
  const tone = getBannerTone(snap, effectiveStatus);
  const bannerStyles = BANNER_STYLES[tone];
  const BannerIcon = bannerStyles.icon;
  const actionSteps = snap
    ? ACTION_STEPS_BY_STATUS[effectiveStatus]
    : [PLACEHOLDER_ACTION_STEP];
  const uptimePercent = computeUptimePercent(snap, effectiveStatus);

  return (
    <>
      {/* Hero Status */}
      <section
        className={`${GLASS_CARD} relative overflow-hidden rounded-2xl p-8 ${bannerStyles.glow}`}
      >
        <div className="pointer-events-none absolute top-0 right-0 p-6 opacity-10">
          <BannerIcon className="size-32" />
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`status-pulse-ring size-3 rounded-full ${bannerStyles.dot}`}
              />
              <span
                className={`text-xs font-semibold tracking-widest uppercase ${bannerStyles.label}`}
              >
                {BANNER_LABELS[tone]}
              </span>
            </div>
            <h1 className="mb-1 text-4xl font-bold tracking-tight text-[#dae2fd] sm:text-5xl">
              {getBannerTitle(tone, criticalService)}
            </h1>
            <p className="max-w-2xl text-lg text-[#c2c6d6]">
              {getBannerDescription(tone, snap)}
            </p>
          </div>
          <div
            className={`${GLASS_CARD} rounded-xl border-white/5 bg-[#171f33]/20 p-4 text-right`}
          >
            <p className="mb-1 text-xs tracking-wider text-[#c2c6d6] uppercase">
              Last Healthy Timestamp
            </p>
            <p className="text-lg font-bold text-[#adc6ff]">
              {snap?.lastHealthyAt
                ? formatUtcTimestamp(snap.lastHealthyAt)
                : "Never"}
            </p>
            <p className="mt-1 text-sm text-[#c2c6d6]">
              {snap?.lastHealthyAt
                ? formatRelativeTime(snap.lastHealthyAt, now)
                : "—"}
            </p>
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Brain className="size-8 text-[#adc6ff]" />
                <h2 className="text-xl font-semibold text-[#dae2fd]">
                  Diagnosis Engine Interpretation
                </h2>
              </div>
              <button
                className="flex items-center gap-2 rounded-lg border border-[#adc6ff]/20 bg-[#adc6ff]/10 px-3 py-1.5 text-xs font-semibold text-[#adc6ff] transition-colors hover:bg-[#adc6ff]/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!snap || aiLoading}
                onClick={handleGenerateAiReport}
                type="button"
              >
                {aiLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {aiLoading
                  ? "Generating…"
                  : aiReport
                    ? "Regenerate AI Report"
                    : "Generate AI Report"}
              </button>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#222a3d]/30 p-4 backdrop-blur-md">
              {aiReport ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#c0c1ff] uppercase">
                      <Sparkles className="size-3.5" />
                      AI-Generated Report
                    </div>
                    {aiReportIsStale && (
                      <span className="text-xs text-amber-400">
                        A newer scan has landed — regenerate for the latest
                        data
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-[#dae2fd]">
                    {aiReport}
                  </p>
                </div>
              ) : (
                <p className="leading-relaxed text-[#dae2fd]">
                  {snap
                    ? getDiagnosisText(snap, failedServices)
                    : "No scan data yet. Run a scan from the Dashboard to populate live diagnostics."}
                </p>
              )}
              {aiError && (
                <p className="mt-3 text-sm text-[#ffb4ab]">
                  Couldn&apos;t generate AI report: {aiError}.
                  {aiReport
                    ? " Showing the previously generated report."
                    : " Showing the rule-based summary instead."}
                </p>
              )}
              {snap && !aiReport && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#c0c1ff]/10 bg-[#3131c0]/20 px-4 py-2">
                  <span className="text-xs font-bold tracking-widest text-[#c0c1ff] uppercase">
                    Logic Insight
                  </span>
                  <p className="text-[#dae2fd]">
                    {getLogicInsight(snap, effectiveStatus, failedServices)}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Action Plan */}
          <section className={`${GLASS_CARD} rounded-2xl p-6`}>
            <h2 className="mb-6 text-xl font-semibold text-[#dae2fd]">
              Recommended Action Plan
            </h2>
            <div className="space-y-4">
              {actionSteps.map(({ title, description }, index) => (
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
                  {REGION}
                </span>
              </div>
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-[#c2c6d6]">24h Uptime</span>
                  <span className="text-xs font-bold text-[#adc6ff]">
                    {uptimePercent}
                    {uptimePercent !== "—" ? "%" : ""}
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
              {snap && snap.services.length > 0 ? (
                snap.services.map((service) => {
                  const Icon = getServiceIcon(service.name);
                  const depTone = toneForServiceStatus(service.status);
                  return (
                    <div
                      className={`flex items-center justify-between rounded-xl border p-2 transition-all ${
                        depTone === "error"
                          ? "border-[#ffb4ab]/20 bg-[#93000a]/10 hover:bg-[#93000a]/20"
                          : depTone === "warning"
                            ? "border-amber-400/20 bg-amber-400/10 hover:bg-amber-400/20"
                            : "border-white/5 bg-[#171f33]/20 hover:bg-white/5"
                      }`}
                      key={service.host}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`size-5 ${
                            depTone === "error"
                              ? "text-[#ffb4ab]"
                              : depTone === "warning"
                                ? "text-amber-400"
                                : "text-[#adc6ff]"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {service.name}
                        </span>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold ${
                          depTone === "error"
                            ? "text-[#ffb4ab]"
                            : depTone === "warning"
                              ? "text-amber-400"
                              : "text-[#adc6ff]"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            depTone === "error"
                              ? "animate-pulse bg-[#ffb4ab]"
                              : depTone === "warning"
                                ? "animate-pulse bg-amber-400"
                                : "bg-[#adc6ff]"
                          }`}
                        />
                        {service.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="p-2 text-sm text-[#c2c6d6]">
                  No scan data available yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
