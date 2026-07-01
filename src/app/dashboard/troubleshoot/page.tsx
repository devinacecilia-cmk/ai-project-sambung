"use client";

import { useState, type ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Headset,
  ListChecks,
  MessagesSquare,
  Palette,
  RadioTower,
  XCircle,
} from "lucide-react";

import { GLASS_CARD } from "@/components/dashboard/glass-card";

const STATUS_CARDS: {
  icon: ComponentType<{ className?: string }>;
  tone: "emerald" | "amber" | "error";
  tag: string;
  title: string;
  description: string;
}[] = [
  {
    icon: CheckCircle2,
    tone: "emerald",
    tag: "Optimal",
    title: "Emerald: Connected",
    description:
      "The node is fully operational. Data flows seamlessly, and response times are within the standard enterprise threshold. No action required.",
  },
  {
    icon: AlertTriangle,
    tone: "amber",
    tag: "Degraded",
    title: "Amber: Slow",
    description:
      "Traffic is congested or the connection is experiencing packet loss. You may notice delays in application responsiveness. Monitoring is recommended.",
  },
  {
    icon: XCircle,
    tone: "error",
    tag: "Critical",
    title: "Crimson: Not Reachable",
    description:
      "The system has lost connection to the node. Immediate investigation is required to restore service availability.",
  },
];

const STATUS_TONE_CLASSES: Record<
  "emerald" | "amber" | "error",
  { border: string; iconBg: string; text: string; glow: string }
> = {
  emerald: {
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10 border border-emerald-500/20",
    text: "text-emerald-400",
    glow: "hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] hover:border-emerald-500/40",
  },
  amber: {
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10 border border-amber-500/20",
    text: "text-amber-400",
    glow: "hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)] hover:border-amber-500/40",
  },
  error: {
    border: "border-[#ffb4ab]/20",
    iconBg: "bg-[#ffb4ab]/10 border border-[#ffb4ab]/20",
    text: "text-[#ffb4ab]",
    glow: "hover:shadow-[0_10px_30px_-10px_rgba(239,68,68,0.3)] hover:border-[#ffb4ab]/40",
  },
};

const STEPS = [
  {
    id: 1,
    title: "Check VPN Status",
    description:
      "Ensure your corporate VPN client is active and authenticated. A timed-out session is the #1 cause of 'Not Reachable' errors.",
    simMessage: "Scanning VPN Auth Logs...",
    hasGuideLink: true,
  },
  {
    id: 2,
    title: "Restart Browser Cache",
    description:
      "Corrupted local storage or old cache can interfere with real-time dashboards. Try an Incognito window or clear your browser history.",
    simMessage: "Flushing Browser Cache Data...",
    hasGuideLink: false,
  },
  {
    id: 3,
    title: "Verify Node Identifier",
    description:
      "Confirm that the Node ID you are monitoring matches your assigned region. Mismatched nodes will return authentication errors.",
    simMessage: "Verifying Regional Node Handshake...",
    hasGuideLink: false,
  },
];

const LATENCY_LEVELS: {
  label: string;
  range: string;
  color: string;
  barColor: string;
  width: number;
}[] = [
  {
    label: "Fast (Low Latency)",
    range: "0 - 50ms",
    color: "text-emerald-400",
    barColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    width: 15,
  },
  {
    label: "Average (Medium Latency)",
    range: "50 - 200ms",
    color: "text-amber-400",
    barColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    width: 60,
  },
  {
    label: "Congested (High Latency)",
    range: "200ms+",
    color: "text-[#ffb4ab]",
    barColor: "bg-[#ffb4ab] shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    width: 90,
  },
];

export default function TroubleshootPage() {
  const [selectedStep, setSelectedStep] = useState(1);
  const activeStep = STEPS.find((step) => step.id === selectedStep) ?? STEPS[0];

  return (
    <>
      {/* Hero */}
      <section
        className={`${GLASS_CARD} relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center`}
      >
        <div className="absolute inset-0 -z-10 bg-[#adc6ff]/5" />
        <h1 className="mb-4 text-4xl font-bold text-[#adc6ff] sm:text-5xl">
          Network User Guide
        </h1>
        <p className="max-w-2xl text-lg text-[#c2c6d6]">
          Welcome to the SAMBUNG troubleshooting hub. This guide is designed
          to help you navigate network performance and resolve common
          connectivity hurdles without needing a degree in engineering.
        </p>
      </section>

      {/* Understanding Status Colors */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="size-6 text-[#adc6ff]" />
          <h2 className="text-2xl font-semibold text-[#dae2fd]">
            Understanding Status Colors
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STATUS_CARDS.map(({ icon: Icon, tone, tag, title, description }) => {
            const toneClasses = STATUS_TONE_CLASSES[tone];
            return (
              <div
                className={`${GLASS_CARD} space-y-4 rounded-xl p-6 ${toneClasses.border} ${toneClasses.glow}`}
                key={title}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${toneClasses.iconBg}`}>
                    <Icon className={`size-5 ${toneClasses.text}`} />
                  </div>
                  <span
                    className={`text-xs tracking-widest uppercase ${toneClasses.text}`}
                  >
                    {tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#dae2fd]">
                  {title}
                </h3>
                <p className="text-sm text-[#c2c6d6]">{description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Troubleshooting Basics */}
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ListChecks className="size-6 text-[#adc6ff]" />
            <h2 className="text-2xl font-semibold text-[#dae2fd]">
              Troubleshooting Basics
            </h2>
          </div>
          <p className="text-[#c2c6d6]">
            Follow these sequential steps to resolve most common connectivity
            issues before escalating to the engineering team.
          </p>
          <div className="space-y-2">
            {STEPS.map((step) => {
              const isActive = step.id === selectedStep;
              return (
                <div
                  className={`${GLASS_CARD} rounded-xl border-l-4 p-4 ${
                    isActive
                      ? "border-[#adc6ff] bg-[#adc6ff]/5"
                      : "border-transparent opacity-70"
                  }`}
                  key={step.id}
                >
                  <button
                    className="flex w-full items-center gap-4 text-left"
                    onClick={() => setSelectedStep(step.id)}
                    type="button"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-[#adc6ff] text-[#002e6a]"
                          : "bg-[#2d3449] text-[#c2c6d6]"
                      }`}
                    >
                      {String(step.id).padStart(2, "0")}
                    </span>
                    <h4 className="text-lg font-semibold text-[#dae2fd]">
                      {step.title}
                    </h4>
                  </button>
                  {isActive && (
                    <div className="mt-4 space-y-2 pl-12">
                      <p className="text-sm text-[#c2c6d6]">
                        {step.description}
                      </p>
                      {step.hasGuideLink && (
                        <button
                          className="flex items-center gap-1 text-xs font-medium text-[#adc6ff] hover:underline"
                          title="Coming soon"
                          type="button"
                        >
                          View VPN Guide
                          <ExternalLink className="size-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Diagnostic Simulator */}
        <div
          className={`${GLASS_CARD} flex min-h-[400px] flex-col overflow-hidden rounded-xl`}
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
            <span className="text-xs font-semibold text-[#adc6ff]">
              Live Diagnostic Simulator
            </span>
            <div className="flex gap-1">
              <div className="size-3 rounded-full bg-[#ffb4ab]/40" />
              <div className="size-3 rounded-full bg-amber-500/40" />
              <div className="size-3 rounded-full bg-emerald-500/40" />
            </div>
          </div>
          <div className="flex grow flex-col items-center justify-center space-y-6 bg-black/20 p-8">
            <RadioTower className="size-20 animate-pulse text-[#adc6ff]" />
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold text-[#dae2fd]">
                {activeStep.simMessage}
              </p>
              <p className="text-sm text-[#c2c6d6]/60">
                Sequence #0492-SAMBUNG
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Latency? */}
      <section
        className={`${GLASS_CARD} relative overflow-hidden rounded-2xl p-8`}
      >
        <div className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 size-64 bg-[#adc6ff]/10 blur-[100px]" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="size-6 text-[#adc6ff]" />
              <h2 className="text-2xl font-semibold text-[#dae2fd]">
                What is Latency?
              </h2>
            </div>
            <p className="text-[#c2c6d6]">
              In simple terms, latency is the{" "}
              <strong className="text-[#dae2fd]">time delay</strong>{" "}
              between your request (like clicking a button) and the
              system&apos;s response. Think of it as the &quot;echo&quot; of
              your network.
            </p>
            <div className="space-y-3">
              {LATENCY_LEVELS.map(({ label, range, color, barColor, width }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#c2c6d6]">{label}</span>
                    <span className={`font-bold ${color}`}>{range}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#2d3449]">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-xl border border-white/5 bg-[#adc6ff]/5 p-6 text-center">
            <div className="relative flex aspect-square w-full max-w-52 items-center justify-center rounded-lg bg-[#171f33]">
              <span className="absolute size-16 animate-ping rounded-full bg-[#adc6ff]/10" />
              <span className="absolute size-28 animate-ping rounded-full bg-[#adc6ff]/5 [animation-delay:0.3s]" />
              <RadioTower className="relative size-12 text-[#adc6ff]" />
            </div>
            <p className="text-xs text-[#c2c6d6] italic">
              Visual representation of data packet propagation
            </p>
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section
        className={`${GLASS_CARD} flex flex-col items-center justify-between gap-8 rounded-2xl border-[#adc6ff]/20 bg-gradient-to-br from-[#171f33]/60 to-[#0b1326]/40 p-8 md:flex-row`}
      >
        <div className="max-w-xl space-y-4">
          <h2 className="text-2xl font-semibold text-[#dae2fd]">
            Still facing issues?
          </h2>
          <p className="text-[#c2c6d6]">
            Our Enterprise Support Team is available 24/7 to help you
            diagnose complex node failures and routing issues.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-[#2d3449] px-4 py-1.5 text-xs text-[#dae2fd]">
              <Clock className="size-3.5" />
              Avg. Response: 12m
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#2d3449] px-4 py-1.5 text-xs text-[#dae2fd]">
              <CheckCircle2 className="size-3.5" />
              SLA: 99.9%
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-[#adc6ff] px-8 py-3 font-bold text-[#002e6a] shadow-lg shadow-[#adc6ff]/20 transition-all hover:brightness-110 active:scale-95"
            title="Coming soon"
            type="button"
          >
            <Headset className="size-4" />
            Open Support Ticket
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-xl border border-[#424754] px-8 py-3 font-bold text-[#dae2fd] transition-all hover:bg-[#2d3449] active:scale-95"
            title="Coming soon"
            type="button"
          >
            <MessagesSquare className="size-4" />
            Chat with Engineer
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 pt-6 text-center">
        <p className="text-xs tracking-widest text-[#c2c6d6]/40 uppercase">
          © 2026 SAMBUNG ENTERPRISE NETWORKS | V4.12.0
        </p>
      </footer>
    </>
  );
}
