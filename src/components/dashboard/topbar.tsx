"use client";

import { Bell, Menu, RefreshCw, UserCircle } from "lucide-react";

export function Topbar() {
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
  );
}
