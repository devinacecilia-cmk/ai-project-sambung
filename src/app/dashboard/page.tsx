"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  ChevronRight,
  Download,
  Gauge,
  Globe,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  RefreshCw,
  Server,
  Settings,
  Terminal,
  Upload,
  User,
  UserCircle,
  Wifi,
  Wrench,
} from "lucide-react";

import { ShaderBackground } from "@/components/dashboard/shader-background";

const AUTH_STORAGE_KEY = "nhm-auth";

const GLASS_CARD =
  "rounded-xl border border-white/5 bg-[#0f172a]/30 backdrop-blur-lg transition-all duration-300 hover:border-white/10 hover:bg-[#0f172a]/45";

const NAV_ITEMS: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}[] = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Wrench, label: "Diagnostics" },
  { icon: HelpCircle, label: "Troubleshoot" },
  { icon: Settings, label: "Settings" },
];

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

const SERVICE_ROWS: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  status: string;
  latency: string;
  tone: "success" | "error";
}[] = [
  {
    icon: Globe,
    title: "Internet Connection",
    subtitle: "Global gateway protocol access",
    status: "Connected",
    latency: "28 ms",
    tone: "success",
  },
  {
    icon: Server,
    title: "SAP Server",
    subtitle: "Main production cluster nodes",
    status: "Reachable",
    latency: "45 ms",
    tone: "success",
  },
  {
    icon: Building2,
    title: "GL system",
    subtitle: "Internal API & Ledger endpoints",
    status: "Unreachable",
    latency: "—",
    tone: "error",
  },
];

const ACTIVITY_LOGS = [
  {
    time: "14:32:01",
    message: "PING: Internet Gateway (10.0.0.1) - SUCCESS [28ms]",
    tag: "OK",
    color: "emerald",
  },
  {
    time: "14:31:58",
    message: "ERR: GL_System connection timeout - RETRYING...",
    tag: "CRIT",
    color: "red",
  },
  {
    time: "14:31:55",
    message: "PING: SAP_Prod_Srv - REACHABLE [45ms]",
    tag: "OK",
    color: "emerald",
  },
  {
    time: "14:31:40",
    message: "AUTH: Admin login from 192.168.1.105",
    tag: "INFO",
    color: "white",
  },
];

const MOBILE_NAV_ITEMS: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}[] = [
  { icon: HeartPulse, label: "Status", active: true },
  { icon: BookOpen, label: "Guide" },
  { icon: Megaphone, label: "Report" },
  { icon: User, label: "Me" },
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

function PulseDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Reads a browser-only API, so this must stay in an effect: doing it
    // during render would render "authed" on the client but not on the
    // server and cause a hydration mismatch.
    if (window.localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthed(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace("/login");
  }

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-[#8c909f]">
        Loading...
      </main>
    );
  }

  return (
    <div className="isolate min-h-screen bg-[#020617] font-sans text-[#dae2fd]">
      <ShaderBackground />
      {/* Sidebar Navigation */}
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-[#424754]/30 bg-[#060e20]/60 shadow-2xl backdrop-blur-2xl lg:flex">
        <div className="p-6">
          <h1 className="mb-1 text-lg font-bold tracking-tight text-[#adc6ff]">
            SAMBUNG Health
          </h1>
          <p className="flex items-center gap-2 text-sm text-[#c2c6d6]">
            <PulseDot />
            Pulse: Stable
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              className={`flex w-full items-center rounded-r-xl px-4 py-3 text-left transition-all duration-300 ${
                active
                  ? "border-l-[3px] border-[#adc6ff] bg-white/[0.08] text-[#adc6ff]"
                  : "text-[#c2c6d6] hover:bg-white/5 hover:text-[#dae2fd]"
              }`}
              key={label}
              title={active ? undefined : "Coming soon"}
              type="button"
            >
              <Icon className="mr-3 size-5" />
              <span className="text-xs font-medium tracking-widest uppercase">
                {label}
              </span>
            </button>
          ))}
        </nav>
        <div className="space-y-4 p-4">
          <button
            className="w-full rounded-xl bg-[#adc6ff] py-3 font-bold text-[#00285d] shadow-[0_4px_0_0_rgba(0,0,0,0.3),0_8px_15px_-5px_rgba(173,198,255,0.2)] transition-all hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]"
            title="Coming soon"
            type="button"
          >
            Run Full Scan
          </button>
          <div className="border-t border-[#424754]/30 pt-4">
            <button
              className="flex w-full items-center px-4 py-2 text-[#c2c6d6] transition-all hover:text-[#dae2fd]"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="mr-3 size-5" />
              <span className="text-xs font-medium tracking-widest uppercase">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Top AppBar */}
      <header className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between border-b border-[#424754]/20 bg-[#171f33]/30 px-6 py-3 backdrop-blur-xl lg:left-64">
        <div className="flex items-center gap-4">
          <button
            aria-label="Open menu"
            className="text-[#adc6ff] lg:hidden"
            title="Coming soon"
            type="button"
          >
            <Menu className="size-6" />
          </button>
          <span className="text-xl font-bold tracking-tight text-[#adc6ff]">
            SAMBUNG
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="mr-6 hidden py-1 text-sm font-medium text-[#c2c6d6] transition-colors duration-200 hover:text-[#dae2fd] md:block"
            title="Coming soon"
            type="button"
          >
            Alerts
          </button>
          <button
            className="hidden rounded-lg border border-[#ffb4ab]/20 bg-[#93000a]/20 px-4 py-2 text-xs font-bold tracking-wider text-[#ffb4ab] uppercase transition-all hover:bg-[#93000a]/40 active:scale-95 sm:block"
            title="Coming soon"
            type="button"
          >
            Report Issue
          </button>
          <div className="flex gap-2">
            <button
              aria-label="Refresh"
              className="rounded-full p-2 text-[#c2c6d6] transition-colors hover:bg-white/5"
              title="Coming soon"
              type="button"
            >
              <RefreshCw className="size-5" />
            </button>
            <button
              aria-label="Notifications"
              className="relative rounded-full p-2 text-[#c2c6d6] transition-colors hover:bg-white/5"
              title="Coming soon"
              type="button"
            >
              <Bell className="size-5" />
              <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-[#ffb4ab] ring-2 ring-[#020617]" />
            </button>
            <button
              aria-label="Account"
              className="rounded-full p-2 text-[#c2c6d6] transition-colors hover:bg-white/5"
              title="Coming soon"
              type="button"
            >
              <UserCircle className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen pt-24 pr-6 pb-24 lg:pr-8 lg:pb-8 lg:pl-72">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Hero Status */}
          <section className={`${GLASS_CARD} overflow-hidden`}>
            <div className="flex flex-col items-stretch md:flex-row md:items-center">
              <div className="flex-1 p-6">
                <h2 className="mb-1 text-2xl font-semibold text-[#d8e2ff]">
                  System Pulse
                </h2>
                <p className="max-w-lg leading-relaxed text-[#c2c6d6]/90">
                  <span className="font-semibold text-[#d8e2ff]">
                    SAMBUNG:
                  </span>{" "}
                  Enterprise infrastructure monitoring active. Tracking{" "}
                  <span className="font-medium text-white">12 nodes</span>{" "}
                  across <span className="font-medium text-white">
                    3 regions
                  </span>
                  .
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
                <button
                  className="w-full rounded-lg border border-[#adc6ff]/10 bg-[#adc6ff]/5 py-2 text-[11px] font-bold tracking-widest text-[#adc6ff] uppercase transition-all hover:bg-[#adc6ff]/10 active:scale-95"
                  title="Coming soon"
                  type="button"
                >
                  Full Diagnostics
                </button>
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
                  <span className="size-1.5 animate-pulse rounded-full bg-[#adc6ff]" />
                  LIVE UPDATES
                </span>
                <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-[#c2c6d6]">
                  LAST SCAN: 2M AGO
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {SERVICE_ROWS.map(
                ({ icon: Icon, title, subtitle, status, latency, tone }) => (
                  <div
                    className={`${GLASS_CARD} flex items-center gap-4 px-6 py-4 ${
                      tone === "success"
                        ? "hover:shadow-[0_10px_40px_-15px_rgba(16,185,129,0.2)] hover:border-emerald-500/30"
                        : "hover:shadow-[0_10px_40px_-15px_rgba(239,68,68,0.2)] hover:border-red-500/30"
                    }`}
                    key={title}
                  >
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg border ${
                        tone === "success"
                          ? "border-[#adc6ff]/10 bg-[#adc6ff]/10 text-[#adc6ff]"
                          : "border-[#ffb4ab]/10 bg-[#93000a]/10 text-[#ffb4ab]"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-bold">{title}</h4>
                      <p className="text-xs text-[#c2c6d6]/70">{subtitle}</p>
                    </div>
                    <div className="hidden flex-1 justify-center md:flex">
                      <div
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                          tone === "success"
                            ? "border-emerald-500/20 bg-emerald-500/10"
                            : "border-red-500/20 bg-red-500/10"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            tone === "success" ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold tracking-wider uppercase ${
                            tone === "success"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="w-24 text-right">
                        <span className="block text-[10px] font-bold tracking-tighter text-[#c2c6d6]/50 uppercase">
                          Latency
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            latency === "—" ? "text-[#c2c6d6]/40" : "text-white"
                          }`}
                        >
                          {latency}
                        </span>
                      </div>
                      <button
                        aria-label={`View ${title} details`}
                        className="text-[#c2c6d6]/40 transition-colors hover:text-white"
                        title="Coming soon"
                        type="button"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </div>
                  </div>
                ),
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
              className={`${GLASS_CARD} space-y-1 overflow-hidden border-emerald-500/10 bg-black/40 px-6 py-4 font-mono`}
            >
              {ACTIVITY_LOGS.map(({ time, message, tag, color }) => (
                <div
                  className={`flex items-center gap-3 text-[11px] ${
                    color === "emerald"
                      ? "text-emerald-400/90"
                      : color === "red"
                        ? "text-red-400/90"
                        : "text-[#c2c6d6]"
                  }`}
                  key={time}
                >
                  <span className="opacity-40">{time}</span>
                  <span className="flex-1 truncate">{message}</span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] leading-none ${
                      color === "emerald"
                        ? "border-emerald-500/30"
                        : color === "red"
                          ? "border-red-500/30"
                          : "border-white/10"
                    }`}
                  >
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-[#2d3449]/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
        {MOBILE_NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            className={`flex flex-col items-center justify-center ${
              active ? "text-[#adc6ff]" : "text-[#c2c6d6]"
            }`}
            key={label}
            title={active ? undefined : "Coming soon"}
            type="button"
          >
            <Icon className="size-6" />
            <span className="mt-1 text-[10px] font-bold tracking-wider uppercase">
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
