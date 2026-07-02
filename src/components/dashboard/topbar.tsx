"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, RefreshCw } from "lucide-react";

import { NavbarAccount } from "@/components/dashboard/navbar-account";
import { ReportIssueDialog } from "@/components/dashboard/report-issue-dialog";
import { useScan } from "@/components/dashboard/scan-provider";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "History", href: "/dashboard/history" },
];

export function Topbar() {
  const pathname = usePathname();
  const { isScanning, triggerScan } = useScan();

  return (
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
        <div className="mr-6 hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                className={`py-1 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "border-b-2 border-[#adc6ff] font-bold text-[#adc6ff]"
                    : "text-[#c2c6d6] hover:text-[#dae2fd]"
                }`}
                href={href}
                key={href}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <ReportIssueDialog
          trigger={
            <button
              className="hidden rounded-lg border border-[#ffb4ab]/20 bg-[#93000a]/20 px-4 py-2 text-xs font-bold tracking-wider text-[#ffb4ab] uppercase transition-all hover:bg-[#93000a]/40 active:scale-95 sm:block"
              type="button"
            >
              Report Issue
            </button>
          }
        />
        <div className="flex gap-2">
          <button
            aria-label="Refresh"
            className="rounded-full p-2 text-[#c2c6d6] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isScanning}
            onClick={() => triggerScan()}
            type="button"
          >
            <RefreshCw
              className={`size-5 ${isScanning ? "animate-spin" : ""}`}
            />
          </button>
          <NavbarAccount />
        </div>
      </div>
    </header>
  );
}
