"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CircleAlert,
  History,
  Info,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Siren,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";

import { GLASS_CARD } from "@/components/dashboard/glass-card";
import { loadReports, type Report } from "@/lib/reports-store";

type Severity = "critical" | "warning" | "minor";

const SEVERITY_STYLES: Record<
  Severity,
  {
    label: string;
    border: string;
    iconBg: string;
    iconText: string;
    badge: string;
    glow: string;
  }
> = {
  critical: {
    label: "Critical",
    border: "border-l-[#ffb4ab]",
    iconBg: "bg-[#ffb4ab]/10",
    iconText: "text-[#ffb4ab]",
    badge: "border-[#ffb4ab]/30 bg-[#ffb4ab]/20 text-[#ffb4ab]",
    glow: "hover:-translate-y-0.5 hover:border-[#ffb4ab]/40 hover:shadow-[0_10px_30px_-10px_rgba(239,68,68,0.3)]",
  },
  warning: {
    label: "Warning",
    border: "border-l-amber-400",
    iconBg: "bg-amber-400/10",
    iconText: "text-amber-400",
    badge: "border-amber-400/30 bg-amber-400/20 text-amber-400",
    glow: "hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)]",
  },
  minor: {
    label: "Minor",
    border: "border-l-[#adc6ff]",
    iconBg: "bg-[#adc6ff]/10",
    iconText: "text-[#adc6ff]",
    badge: "border-[#adc6ff]/30 bg-[#adc6ff]/20 text-[#adc6ff]",
    glow: "hover:-translate-y-0.5 hover:border-[#adc6ff]/40 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)]",
  },
};

const SEVERITY_FILTERS: { value: "all" | Severity; label: string }[] = [
  { value: "all", label: "All Severities" },
  { value: "critical", label: "Critical Only" },
  { value: "warning", label: "Warning Only" },
  { value: "minor", label: "Minor Only" },
];

const STAT_CARDS: {
  label: string;
  value: string;
  trend?: {
    icon: ComponentType<{ className?: string }>;
    text: string;
    color: string;
  };
  icon: ComponentType<{ className?: string }>;
  progress?: number;
}[] = [
  {
    label: "Total Incidents",
    value: "14",
    trend: { icon: TrendingUp, text: "12%", color: "text-[#ffb4ab]" },
    icon: Zap,
  },
  {
    label: "MTTR (Avg)",
    value: "18m",
    trend: { icon: TrendingDown, text: "4m", color: "text-emerald-400" },
    icon: History,
  },
  {
    label: "SLA Compliance",
    value: "99.98%",
    icon: ShieldCheck,
    progress: 99.98,
  },
];

type Incident = {
  id: string | number;
  title: string;
  severity: Severity;
  icon: ComponentType<{ className?: string }>;
  duration: string;
  resolution: string;
  resolutionIcon: ComponentType<{ className?: string }>;
  date: string;
  time: string;
  detail:
    | { kind: "paragraph"; text: string }
    | { kind: "root-cause"; rootCause: string; actions: string[] };
};

const URGENCY_TO_SEVERITY: Record<Report["urgency"], Severity> = {
  critical: "critical",
  high: "warning",
  medium: "warning",
  low: "minor",
};

function reportToIncident(report: Report): Incident {
  const submitted = new Date(report.submittedAt);
  return {
    id: report.id,
    title: report.system,
    severity: URGENCY_TO_SEVERITY[report.urgency],
    icon: Megaphone,
    duration: "Ongoing",
    resolution: "Pending Review",
    resolutionIcon: Clock,
    date: submitted.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: `${submitted.toISOString().slice(11, 19)} UTC`,
    detail: { kind: "paragraph", text: report.description },
  };
}

const STATIC_INCIDENTS: Incident[] = [
  {
    id: 1,
    title: "Database Connection Timeout",
    severity: "critical",
    icon: CircleAlert,
    duration: "42m 12s",
    resolution: "Resolved by IT",
    resolutionIcon: CheckCircle2,
    date: "Jun 29, 2026",
    time: "14:22:10 UTC",
    detail: {
      kind: "root-cause",
      rootCause:
        "Surge in concurrent connections from the API Gateway exceeded the connection pool limit (5000). Load balancer failed to shed traffic during the peak window.",
      actions: [
        "Scale database nodes +2",
        "Connection pool increased to 8000",
        "Automated retry logic updated",
      ],
    },
  },
  {
    id: 2,
    title: "Latency Spike - US-EAST-1",
    severity: "warning",
    icon: TriangleAlert,
    duration: "15m 05s",
    resolution: "Auto-Recovered",
    resolutionIcon: RefreshCw,
    date: "Jun 29, 2026",
    time: "09:15:44 UTC",
    detail: {
      kind: "paragraph",
      text: "Network routing flapping detected at the edge provider. System automatically rerouted traffic through backup gateway. Normal service resumed after BGP convergence.",
    },
  },
  {
    id: 3,
    title: "SSL Certificate Renewal",
    severity: "minor",
    icon: Info,
    duration: "2m 30s",
    resolution: "Resolved by IT",
    resolutionIcon: CheckCircle2,
    date: "Jun 28, 2026",
    time: "23:00:00 UTC",
    detail: {
      kind: "paragraph",
      text: "Manual rotation of wildcard certificates for the staging environment. Pre-emptive action performed during scheduled maintenance window.",
    },
  },
  {
    id: 4,
    title: "Storage Cluster Failure",
    severity: "critical",
    icon: Siren,
    duration: "3h 12m",
    resolution: "Resolved by IT",
    resolutionIcon: CheckCircle2,
    date: "Jun 27, 2026",
    time: "04:45:12 UTC",
    detail: {
      kind: "paragraph",
      text: "Cascading hardware failure in the primary SAN. Failover to hot-standby delayed by controller sync error. Storage reconstructed from parity drives. High priority replacement of faulty hardware completed.",
    },
  },
];

export default function HistoryPage() {
  const [incidents, setIncidents] = useState<Incident[]>(STATIC_INCIDENTS);
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(),
  );

  useEffect(() => {
    const submitted = loadReports();
    if (submitted.length === 0) return;
    // Reads localStorage, so this must stay in an effect rather than render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncidents([...submitted.map(reportToIncident), ...STATIC_INCIDENTS]);
  }, []);

  const filteredIncidents = useMemo(
    () =>
      severityFilter === "all"
        ? incidents
        : incidents.filter((incident) => incident.severity === severityFilter),
    [incidents, severityFilter],
  );

  function toggleExpanded(id: string | number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <header>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-1 text-3xl font-semibold text-[#d8e2ff]">
              System History
            </h1>
            <p className="max-w-2xl text-[#c2c6d6]">
              Complete audit log of system availability and incident responses
              across the core network infrastructure.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                className={`${GLASS_CARD} cursor-pointer appearance-none rounded-lg border-none bg-[#222a3d]/50 py-1.5 pr-8 pl-4 text-sm text-[#dae2fd] focus:ring-1 focus:ring-[#adc6ff] focus:outline-none`}
                onChange={(event) =>
                  setSeverityFilter(event.target.value as "all" | Severity)
                }
                value={severityFilter}
              >
                {SEVERITY_FILTERS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-[#c2c6d6]" />
            </div>
            <div className="relative">
              <select
                className={`${GLASS_CARD} cursor-pointer appearance-none rounded-lg border-none bg-[#222a3d]/50 py-1.5 pr-8 pl-4 text-sm text-[#dae2fd] focus:ring-1 focus:ring-[#adc6ff] focus:outline-none`}
                defaultValue="30"
                title="Coming soon"
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="ytd">Year to Date</option>
              </select>
              <Calendar className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-[#c2c6d6]" />
            </div>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STAT_CARDS.map(({ label, value, trend, icon: Icon, progress }) => (
            <div
              className={`${GLASS_CARD} group relative flex h-32 flex-col justify-between overflow-hidden rounded-xl p-6`}
              key={label}
            >
              <span className="text-xs font-bold tracking-widest text-[#c2c6d6] uppercase">
                {label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#dae2fd]">
                  {value}
                </span>
                {trend && (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold ${trend.color}`}
                  >
                    <trend.icon className="size-3.5" />
                    {trend.text}
                  </span>
                )}
              </div>
              {progress !== undefined && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#2d3449]">
                  <div
                    className="h-full bg-[#adc6ff] shadow-[0_0_8px_rgba(173,198,255,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-5 transition-opacity group-hover:opacity-10">
                <Icon className="size-32" />
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Incident List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 px-4 pb-1">
          <span className="w-1/4 text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase">
            Incident &amp; Status
          </span>
          <span className="hidden w-1/4 text-center text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase md:block">
            Duration
          </span>
          <span className="hidden w-1/4 text-center text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase md:block">
            Resolution
          </span>
          <span className="w-1/4 text-right text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase">
            Timestamp
          </span>
        </div>

        {filteredIncidents.map((incident) => {
          const styles = SEVERITY_STYLES[incident.severity];
          const isExpanded = expandedIds.has(incident.id);
          const ResolutionIcon = incident.resolutionIcon;
          const Icon = incident.icon;

          return (
            <div key={incident.id}>
              <button
                className={`${GLASS_CARD} w-full rounded-xl border-l-4 p-4 text-left ${styles.border} ${styles.glow}`}
                onClick={() => toggleExpanded(incident.id)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <div className="flex w-full items-center gap-4 md:w-1/4">
                    <div
                      className={`relative flex size-10 shrink-0 items-center justify-center rounded-lg ${styles.iconBg} ${styles.iconText}`}
                    >
                      <span className="sonar-wave" />
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#dae2fd]">
                        {incident.title}
                      </h3>
                      <span
                        className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${styles.badge}`}
                      >
                        {SEVERITY_STYLES[incident.severity].label}
                      </span>
                    </div>
                  </div>
                  <div className="hidden w-1/4 text-center md:block">
                    <span className="text-sm text-[#c2c6d6]">
                      {incident.duration}
                    </span>
                  </div>
                  <div className="hidden w-1/4 text-center md:block">
                    <span className="flex items-center justify-center gap-1 text-sm text-emerald-400">
                      <ResolutionIcon className="size-3.5" />
                      {incident.resolution}
                    </span>
                  </div>
                  <div className="w-1/4 text-right">
                    <span className="block text-xs text-[#c2c6d6]">
                      {incident.date}
                    </span>
                    <span className="block text-xs opacity-50">
                      {incident.time}
                    </span>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div
                  className={`${GLASS_CARD} -mt-2 rounded-b-xl border-t-0 px-6 py-4`}
                >
                  {incident.detail.kind === "root-cause" ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-xs font-bold tracking-widest text-[#c2c6d6] uppercase">
                          Root Cause Analysis
                        </h4>
                        <p className="text-sm leading-relaxed text-[#dae2fd]/80">
                          {incident.detail.rootCause}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold tracking-widest text-[#c2c6d6] uppercase">
                          Action Taken
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {incident.detail.actions.map((action) => (
                            <li
                              className="flex items-center gap-2"
                              key={action}
                            >
                              <span className="size-1 rounded-full bg-[#adc6ff]" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#dae2fd]/80">
                      {incident.detail.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredIncidents.length === 0 && (
          <div
            className={`${GLASS_CARD} rounded-xl p-8 text-center text-sm text-[#c2c6d6]`}
          >
            No incidents match this filter.
          </div>
        )}
      </section>

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-2">
        <span className="text-xs text-[#c2c6d6]/60">
          Showing 1-{filteredIncidents.length} of 42 incidents
        </span>
        <div className="flex gap-2">
          <button
            className={`${GLASS_CARD} flex size-8 items-center justify-center rounded-lg text-[#dae2fd] transition-colors hover:bg-[#adc6ff]/20`}
            title="Coming soon"
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-[#adc6ff] text-xs font-bold text-[#00285d]">
            1
          </button>
          <button
            className={`${GLASS_CARD} flex size-8 items-center justify-center rounded-lg text-xs font-bold text-[#dae2fd] transition-colors hover:bg-white/10`}
            title="Coming soon"
            type="button"
          >
            2
          </button>
          <button
            className={`${GLASS_CARD} flex size-8 items-center justify-center rounded-lg text-xs font-bold text-[#dae2fd] transition-colors hover:bg-white/10`}
            title="Coming soon"
            type="button"
          >
            3
          </button>
          <button
            className={`${GLASS_CARD} flex size-8 items-center justify-center rounded-lg text-[#dae2fd] transition-colors hover:bg-[#adc6ff]/20`}
            title="Coming soon"
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </>
  );
}
