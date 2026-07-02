"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { Download, Gauge, Loader2, Terminal, Upload, Wifi } from "lucide-react";

import { GLASS_CARD } from "@/components/dashboard/glass-card";
import { PulseDot } from "@/components/dashboard/pulse-dot";
import { useScan } from "@/components/dashboard/scan-provider";
import { saveSnapshot } from "@/lib/diagnostics-store";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getServiceIcon, toneForServiceStatus } from "@/lib/service-display";
import { useSpeedTest, type TestStatus } from "@/hooks/use-speed-test";

const SPEED_TEST_INTERVAL_MS = 5 * 60_000;

const STATUS_TITLES: Record<
  "OPERATIONAL" | "DEGRADED" | "DISCONNECTED",
  string
> = {
  OPERATIONAL: "Systems Operational",
  DEGRADED: "Network Degraded",
  DISCONNECTED: "Internet Unreachable",
};

const STATUS_ICON_STYLES: Record<
  "OPERATIONAL" | "DEGRADED" | "DISCONNECTED",
  { ring: string; iconWrap: string; iconText: string }
> = {
  OPERATIONAL: {
    ring: "border-emerald-500/20",
    iconWrap: "border-emerald-500/10 bg-emerald-500/5",
    iconText: "text-emerald-400",
  },
  DEGRADED: {
    ring: "border-amber-400/20",
    iconWrap: "border-amber-400/10 bg-amber-400/5",
    iconText: "text-amber-400",
  },
  DISCONNECTED: {
    ring: "border-[#ffb4ab]/20",
    iconWrap: "border-[#ffb4ab]/10 bg-[#ffb4ab]/5",
    iconText: "text-[#ffb4ab]",
  },
};

const TESTING_PHASE_MESSAGES: Partial<Record<TestStatus, string>> = {
  "testing-latency": "Testing latency...",
  "testing-download": "Testing download...",
  "testing-upload": "Testing upload...",
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

const SAMBUNG_WORDS: (
  { letter: string; rest: string } | { literal: string }
)[] = [
  { letter: "S", rest: "ystem" },
  { letter: "A", rest: "ccess" },
  { letter: "M", rest: "onitoring" },
  { literal: "&" },
  { letter: "B", rest: "asic" },
  { letter: "U", rest: "ser" },
  { letter: "N", rest: "etwork" },
  { letter: "G", rest: "uide" },
];

function SambungHero() {
  return (
    <header className="border-b border-white/5 pb-6">
      <h1 className="text-3xl font-bold tracking-tight text-[#dae2fd] sm:text-4xl">
        SAMBUNG
      </h1>
      <p className="mt-2 font-mono text-sm text-[#8c909f] sm:text-base">
        {SAMBUNG_WORDS.map((word, index) => (
          <span key={index}>
            {"literal" in word ? (
              <span className="text-[#8c909f]">{word.literal}</span>
            ) : (
              <>
                <span className="font-bold text-emerald-400">
                  {word.letter}
                </span>
                <span>{word.rest}</span>
              </>
            )}
            {index < SAMBUNG_WORDS.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <p className="mt-2 text-xs tracking-widest text-[#8c909f]/60 uppercase">
        Central Mega Kencana · Enterprise Network Monitoring
      </p>
    </header>
  );
}

export default function DashboardOverviewPage() {
  const { services, activityFeed, lastScan, isScanning } = useScan();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const { result: speedResult, testStatus, runTest } = useSpeedTest();
  const isTesting =
    testStatus !== "idle" && testStatus !== "done" && testStatus !== "error";

  useEffect(() => {
    runTest();
    const interval = setInterval(runTest, SPEED_TEST_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (testStatus !== "done") return;
    // Only stamp "last healthy" when the speed test AND every monitored
    // service agree things are fine, so a fast localhost speed test doesn't
    // mask a real service outage found by the ping scan.
    const allServicesHealthy = services.every(
      (service) => service.status === "CONNECTED",
    );
    saveSnapshot({
      latency: speedResult.latency,
      download: speedResult.download,
      upload: speedResult.upload,
      networkStatus: speedResult.status,
      networkStatusMessage: speedResult.statusMessage,
      ...(speedResult.status === "OPERATIONAL" && allServicesHealthy
        ? { lastHealthyAt: speedResult.testedAt ?? new Date().toISOString() }
        : {}),
    });
  }, [testStatus, speedResult, services]);

  const statusStyles = STATUS_ICON_STYLES[speedResult.status];
  const statusSubtitle = isTesting
    ? TESTING_PHASE_MESSAGES[testStatus]
    : speedResult.statusMessage;

  const metricTiles: {
    label: string;
    icon: ComponentType<{ className?: string }>;
    value: string | number;
    unit: string;
    bars: number[];
    barColor: string;
    glow: string;
  }[] = [
    {
      label: "Latency",
      icon: Gauge,
      value:
        testStatus === "testing-latency"
          ? "..."
          : (speedResult.latency ?? "--"),
      unit: "ms",
      bars: [40, 60, 55, 75, 65, 85],
      barColor: "bg-emerald-500",
      glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    },
    {
      label: "Download",
      icon: Download,
      value:
        testStatus === "testing-download"
          ? "..."
          : (speedResult.download ?? "--"),
      unit: "mbps",
      bars: [30, 45, 80, 70, 60, 72],
      barColor: "bg-emerald-500",
      glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    },
    {
      label: "Upload",
      icon: Upload,
      value:
        testStatus === "testing-upload" ? "..." : (speedResult.upload ?? "--"),
      unit: "mbps",
      bars: [50, 40, 35, 45, 55, 45],
      barColor: "bg-amber-400",
      glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    },
  ];

  const connectedServices = services.filter(
    (service) => service.status === "CONNECTED",
  );
  const hasServices = services.length > 0;
  const connectedLatencies = connectedServices
    .map((service) => service.latency)
    .filter((latency): latency is number => latency !== null);
  const avgResponseTime =
    connectedLatencies.length > 0
      ? Math.round(
          connectedLatencies.reduce((sum, latency) => sum + latency, 0) /
            connectedLatencies.length,
        )
      : null;
  const allServicesOnline =
    hasServices && connectedServices.length === services.length;

  const liveStatCards: {
    label: string;
    value: string;
    valueColor: string;
    tag?: string;
    tagColor?: string;
  }[] = [
    {
      label: "Services Online",
      value: hasServices
        ? `${connectedServices.length} / ${services.length}`
        : "—",
      valueColor: !hasServices
        ? "text-[#dae2fd]"
        : allServicesOnline
          ? "text-emerald-400"
          : connectedServices.length === 0
            ? "text-[#ffb4ab]"
            : "text-amber-400",
      tag: hasServices
        ? allServicesOnline
          ? "All Online"
          : `${services.length - connectedServices.length} Down`
        : undefined,
      tagColor: allServicesOnline ? "text-emerald-400/60" : "text-[#ffb4ab]/60",
    },
    {
      label: "Avg Response Time",
      value: avgResponseTime !== null ? `${avgResponseTime} ms` : "—",
      valueColor: "text-[#dae2fd]",
    },
    {
      label: "Last Scan",
      value: lastScan ? formatRelativeTime(lastScan, now) : "—",
      valueColor: "text-[#dae2fd]",
    },
  ];

  return (
    <>
      <SambungHero />

      {/* Monitoring Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {liveStatCards.map(({ label, value, valueColor, tag, tagColor }) => (
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
              {tag && (
                <span className={`text-[10px] font-bold uppercase ${tagColor}`}>
                  {tag}
                </span>
              )}
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
            <div
              className={`relative mb-3 flex size-16 items-center justify-center rounded-full border ${statusStyles.iconWrap}`}
            >
              <div
                className={`absolute inset-0 animate-pulse rounded-full border ${statusStyles.ring}`}
              />
              <Wifi className={`size-6 ${statusStyles.iconText}`} />
            </div>
            <h4 className="mb-1 text-base font-bold tracking-tight">
              {STATUS_TITLES[speedResult.status]}
            </h4>
            <p className="mb-4 text-[11px] leading-tight text-[#c2c6d6]/60">
              {statusSubtitle}
            </p>
            <Link
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#adc6ff]/10 bg-[#adc6ff]/5 py-2 text-center text-[11px] font-bold tracking-widest text-[#adc6ff] uppercase transition-all hover:bg-[#adc6ff]/10 active:scale-95"
              href="/dashboard/diagnostics"
              onClick={() => runTest()}
            >
              {isTesting && <Loader2 className="size-3 animate-spin" />}
              Full Diagnostics
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-8">
            {metricTiles.map(
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
              const Icon = getServiceIcon(service.name);
              const tone = toneForServiceStatus(service.status);
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
                      level === "OK" ? "text-emerald-400/90" : "text-red-400/90"
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
