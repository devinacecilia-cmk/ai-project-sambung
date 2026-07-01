"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Wrench,
  Zap,
} from "lucide-react";

import { PulseDot } from "@/components/dashboard/pulse-dot";

const NAV_ITEMS: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string | null;
}[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Wrench, label: "Diagnostics", href: "/dashboard/diagnostics" },
  { icon: HelpCircle, label: "Troubleshoot", href: "/dashboard/troubleshoot" },
  { icon: Settings, label: "Settings", href: null },
];

export function Sidebar({
  pulseStatus,
  onLogout,
}: {
  pulseStatus: "stable" | "critical";
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-[#424754]/30 bg-[#060e20]/60 shadow-2xl backdrop-blur-2xl lg:flex">
      <div className="p-6">
        <h1 className="mb-1 text-lg font-bold tracking-tight text-[#adc6ff]">
          SAMBUNG Health
        </h1>
        <p className="flex items-center gap-2 text-sm text-[#c2c6d6]">
          <PulseDot tone={pulseStatus === "critical" ? "error" : "success"} />
          Pulse: {pulseStatus === "critical" ? "Critical" : "Stable"}
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = href
            ? href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href)
            : false;
          const className = `flex w-full items-center rounded-r-xl px-4 py-3 text-left transition-all duration-300 ${
            active
              ? "border-l-[3px] border-[#adc6ff] bg-white/[0.08] text-[#adc6ff]"
              : "text-[#c2c6d6] hover:bg-white/5 hover:text-[#dae2fd]"
          }`;
          const content = (
            <>
              <Icon className="mr-3 size-5" />
              <span className="text-xs font-medium tracking-widest uppercase">
                {label}
              </span>
            </>
          );

          return href ? (
            <Link className={className} href={href} key={label}>
              {content}
            </Link>
          ) : (
            <button
              className={className}
              key={label}
              title="Coming soon"
              type="button"
            >
              {content}
            </button>
          );
        })}
      </nav>
      <div className="space-y-4 p-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#adc6ff] py-3 font-bold text-[#00285d] shadow-[0_4px_0_0_rgba(0,0,0,0.3),0_8px_15px_-5px_rgba(173,198,255,0.2)] transition-all hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]"
          title="Coming soon"
          type="button"
        >
          <Zap className="size-4" />
          Run Full Scan
        </button>
        <div className="border-t border-[#424754]/30 pt-4">
          <button
            className="flex w-full items-center px-4 py-2 text-[#c2c6d6] transition-all hover:text-[#dae2fd]"
            onClick={onLogout}
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
  );
}
