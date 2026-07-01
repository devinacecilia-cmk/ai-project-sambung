"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Cloud,
  Download,
  Gauge,
  Globe,
  Loader2,
  Router,
  ShieldBan,
  ShieldCheck,
  Terminal,
  Upload,
  Wifi,
} from "lucide-react";

import type {
  PingAllResponse,
  ServiceLogEntry,
  ServiceResult,
} from "@/app/api/ping-all/route";
import { GLASS_CARD } from "@/components/dashboard/glass-card";
import { PulseDot } from "@/components/dashboard/pulse-dot";

const SCAN_INTERVAL_MS = 30_000;
const ACTIVITY_FEED_LIMIT = 20;

const SERVICE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "Google Public DNS": Globe,
  Cloudflare: Cloud,
  Quad9: ShieldCheck,
  OpenDNS: Router,
  "AdGuard DNS": ShieldBan,
};

type Tone = "success" | "warning" | "error";

const TONE_CLASSES: Record<
  Tone,
  {
    iconWrap: string;
    badgeWrap: string;
    badgeText: string;
    dot: string;
    glow: string;
  }
> = {
  success: {
    iconWrap: "border-[#adc6ff]/10 bg-[#adc6ff]/10 text-[#adc6ff]",
    badgeWrap: "border-emerald-500/20 bg-emerald-500/10",
    badgeText: "text-emerald-400",
    dot: "bg-emerald-400",
    glow: "hover:shadow-[0_10px_40px_-15px_rgba(16,185,129,0.2)] hover:border-emerald-500/30",
  },
  warning: {
    iconWrap: "border-amber-400/10 bg-amber-400/10 text-amber-400",
    badgeWrap: "border-amber-400/20 bg-amber-400/10",
    badgeText: "text-amber-400",
    dot: "bg-amber-400",
    glow: "hover:shadow-[0_10px_40px_-15px_rgba(245,158,11,0.2)] hover:border-amber-400/30",
  },
  error: {
    iconWrap: "border-[#ffb4ab]/10 bg-[#93000a]/10 text-[#ffb4ab]",
    badgeWrap: "border-red-500/20 bg-red-500/10",
    badgeText: "text-red-400",
    dot: "bg-red-400",
    glow: "hover:shadow-[0_10px_40px_-15px_rgba(239,68,68,0.2)] hover:border-red-500/30",
  },
};

function toneForStatus(status: ServiceResult["status"]): Tone {
  if (status === "CONNECTED") return "success";
  if (status === "TIMEOUT") return "warning";
  return "error";
}

function formatRelativeTime(iso: string, now: number): string {
  const diffSeconds = Math.max(
    0,
    Math.round((now - new Date(iso).getTime()) / 1000),
  );
  if (diffSeconds < 5) return "JUST NOW";
  if (diffSeconds < 60) return `${diffSeconds}S AGO`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}M AGO`;
  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours}H AGO`;
}

const STAT_CARDS = [
  {
    label: "Uptime Score",
    value: "99.98%",
    valueColor: "text-emerald-400",
    tag: "Stable",
    tagColor: "text-emerald-400/60",
  },
  {
    label: "Open Incidents",
    value: "4",
    valueColor: "text-[#ffb4ab]",
    tag: "Critical",
    tagColor: "text-[#ffb4ab]/60",
  },
  {
    label: "Last Incident",
    value: "14h",
    valueColor: "text-[#dae2fd]",
    tag: "Ago",
    tagColor: "text-[#8c909f]/60",
  },
];

const METRIC_TILES: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  unit: string;
  bars: number[];
  barColor: string;
  glow: string;
}[] = [
  {
    label: "Latency",
    icon: Gauge,
    value: "24",
    unit: "ms",
    bars: [40, 60, 55, 75, 65, 85],
    barColor: "bg-emerald-500",
    glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  },
  {
    label: "Download",
    icon: Download,
    value: "142.8",
    unit: "mbps",
    bars: [30, 45, 80, 70, 60, 72],
    barColor: "bg-emerald-500",
    glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  },
  {
    label: "Upload",
    icon: Upload,
    value: "38.4",
    unit: "mbps",
    bars: [50, 40, 35, 45, 55, 45],
    barColor: "bg-amber-400",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  },
];

function HealthRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative flex size-28 items-center justify-center">
      <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          className="drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] transition-[stroke-dashoffset] duration-1000 ease-out"
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="#34d399"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
          {percent}%
        </span>
        <span className="text-[10px] font-bold tracking-tighter text-emerald-400/70 uppercase">
          Global
        </span>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const [services, setServices] = useState<ServiceResult[]>([]);
  const [activityFeed, setActivityFeed] = useState<ServiceLogEntry[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function runScan() {
      setIsScanning(true);
      try {
        const res = await fetch("/api/ping-all");
        const data: PingAllResponse = await res.json();
        if (cancelled) return;
        setServices(data.results);
        setLastScan(data.scannedAt);
        setActivityFeed((previous) =>
          [...data.results.map((result) => result.logEntry), ...previous].slice(
            0,
            ACTIVITY_FEED_LIMIT,
          ),
        );
      } catch (error) {
        console.error("Scan failed", error);
      } finally {
        if (!cancelled) setIsScanning(false);
      }
    }

    runScan();
    const interval = setInterval(runScan, SCAN_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <>
      {/* Hero Status */}
      <section className={`${GLASS_CARD} overflow-hidden`}>
        <div className="flex flex-col items-stretch md:flex-row md:items-center">
          <div className="flex-1 p-6">
            <h2 className="mb-1 text-2xl font-semibold text-[#d8e2ff]">
              System Pulse
            </h2>
            <p className="max-w-lg leading-relaxed text-[#c2c6d6]/90">
              <span className="font-semibold text-[#d8e2ff]">SAMBUNG:</span>{" "}
              Enterprise infrastructure monitoring active. Tracking{" "}
              <span className="font-medium text-white">12 nodes</span> across{" "}
              <span className="font-medium text-white">3 regions</span>.
            </p>
          </div>
          <div className="flex min-w-[220px] flex-col items-center justify-center border-[#424754]/20 bg-[#adc6ff]/5 p-6 md:border-l">
            <HealthRing percent={82} />
            <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-slate-800/50">
              <div className="h-full w-[82%] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STAT_CARDS.map(({ label, value, valueColor, tag, tagColor }) => (
          <div
            className={`${GLASS_CARD} flex min-h-[100px] flex-col justify-between p-4`}
            key={label}
          >
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#c2c6d6]/50 uppercase">
              {label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`font-mono text-2xl font-bold ${valueColor}`}>
                {value}
              </span>
              <span className={`text-[10px] font-bold uppercase ${tagColor}`}>
                {tag}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Network Diagnostics */}
      <section className="space-y-3">
        <h3 className="px-1 text-xs font-semibold tracking-[0.2em] text-[#c2c6d6]/70 uppercase">
          Network Diagnostics
        </h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div
            className={`${GLASS_CARD} flex flex-col items-center p-4 text-center lg:col-span-4`}
          >
            <div className="relative mb-3 flex size-16 items-center justify-center rounded-full border border-emerald-500/10 bg-emerald-500/5">
              <div className="absolute inset-0 animate-pulse rounded-full border border-emerald-500/20" />
              <Wifi className="size-6 text-emerald-400" />
            </div>
            <h4 className="mb-1 text-base font-bold tracking-tight">
              Systems Operational
            </h4>
            <p className="mb-4 text-[11px] leading-tight text-[#c2c6d6]/60">
              Gateway reports optimal handshake protocols.
            </p>
            <Link
              className="w-full rounded-lg border border-[#adc6ff]/10 bg-[#adc6ff]/5 py-2 text-center text-[11px] font-bold tracking-widest text-[#adc6ff] uppercase transition-all hover:bg-[#adc6ff]/10 active:scale-95"
              href="/dashboard/diagnostics"
            >
              Full Diagnostics
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-8">
            {METRIC_TILES.map(
              ({ label, icon: Icon, value, unit, bars, barColor, glow }) => (
                <div
                  className={`${GLASS_CARD} flex min-h-[130px] flex-col justify-between p-4`}
                  key={label}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-[#c2c6d6]/50 uppercase">
                      {label}
                    </span>
                    <Icon className="size-4 text-[#adc6ff]/60" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-bold tracking-tighter text-[#dae2fd]">
                        {value}
                      </span>
                      <span className="text-[10px] font-bold text-[#c2c6d6]/60 uppercase">
                        {unit}
                      </span>
                    </div>
                    <div className="flex h-8 items-end gap-0.5">
                      {bars.map((height, index) => (
                        <div
                          className={`flex-1 rounded-t-sm ${
                            index === bars.length - 1
                              ? `${barColor} ${glow}`
                              : `${barColor}/40`
                          }`}
                          key={index}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Service Availability */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-[#c2c6d6]/70 uppercase">
            Service Availability
          </h3>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-[#c2c6d6]">
              {isScanning ? (
                <Loader2 className="size-3 animate-spin text-[#adc6ff]" />
              ) : (
                <span className="size-1.5 animate-pulse rounded-full bg-[#adc6ff]" />
              )}
              LIVE UPDATES
            </span>
            <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-[#c2c6d6]">
              LAST SCAN:{" "}
              {lastScan ? formatRelativeTime(lastScan, now) : "PENDING"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {services.length === 0 ? (
            <div
              className={`${GLASS_CARD} flex items-center gap-3 px-6 py-4 text-sm text-[#c2c6d6]`}
            >
              <Loader2 className="size-4 animate-spin text-[#adc6ff]" />
              Scanning services...
            </div>
          ) : (
            services.map((service) => {
              const Icon = SERVICE_ICONS[service.name] ?? Globe;
              const tone = toneForStatus(service.status);
              const toneClasses = TONE_CLASSES[tone];
              const latencyText =
                service.latency !== null ? `${service.latency} ms` : "—";

              return (
                <div
                  className={`${GLASS_CARD} flex items-center gap-4 px-6 py-4 ${toneClasses.glow}`}
                  key={service.name}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg border ${toneClasses.iconWrap}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-bold">
                      {service.name}
                    </h4>
                    <p className="text-xs text-[#c2c6d6]/70">{service.ip}</p>
                  </div>
                  <div className="hidden flex-1 justify-center md:flex">
                    <div
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 ${toneClasses.badgeWrap}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${toneClasses.dot}`}
                      />
                      <span
                        className={`text-xs font-bold tracking-wider uppercase ${toneClasses.badgeText}`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="block text-[10px] font-bold tracking-tighter text-[#c2c6d6]/50 uppercase">
                      Response Time
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        latencyText === "—" ? "text-[#c2c6d6]/40" : "text-white"
                      }`}
                    >
                      {latencyText}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 px-1 text-xs font-semibold tracking-[0.2em] text-[#c2c6d6]/70 uppercase">
          <Terminal className="size-4" />
          <span>Live Activity Feed</span>
          <span className="ml-auto flex items-center gap-1.5 normal-case">
            <PulseDot />
            <span className="text-[9px] font-bold tracking-widest text-emerald-400/70">
              OPERATIONAL
            </span>
          </span>
        </h3>
        <div
          className={`${GLASS_CARD} log-marquee-viewport relative h-[168px] overflow-hidden border-emerald-500/10 bg-black/40 font-mono`}
        >
          <div className="log-marquee-content flex flex-col gap-3 px-6 py-4">
            {activityFeed.length === 0 ? (
              <div className="flex items-center gap-3 text-[11px] text-[#c2c6d6]/60">
                Waiting for first scan...
              </div>
            ) : (
              [...activityFeed, ...activityFeed].map(
                ({ time, message, level }, index) => (
                  <div
                    className={`flex items-center gap-3 text-[11px] ${
                      level === "OK"
                        ? "text-emerald-400/90"
                        : "text-red-400/90"
                    }`}
                    key={`${time}-${message}-${index}`}
                  >
                    <span className="opacity-40">{time}</span>
                    <span className="flex-1 truncate">{message}</span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] leading-none ${
                        level === "OK"
                          ? "border-emerald-500/30"
                          : "border-red-500/30"
                      }`}
                    >
                      {level}
                    </span>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}
