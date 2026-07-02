"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, User, UserCircle } from "lucide-react";

import { GLASS_CARD } from "@/components/dashboard/glass-card";

const USER_STORAGE_KEY = "nhm-user";

// Navbar account control: a minimal dropdown showing the logged-in user with
// Profile / Settings shortcuts. Logout intentionally lives only in the sidebar
// to avoid redundancy.
export function NavbarAccount() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("admin");
  const menuRef = useRef<HTMLDivElement>(null);

  // Read the username from localStorage on mount (client-only) so the label
  // reflects whoever signed in rather than a hardcoded value.
  useEffect(() => {
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsername(stored);
    }
  }, []);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        className={`rounded-full p-2 transition-colors hover:bg-white/5 focus:ring-1 focus:ring-[#adc6ff] focus:outline-none ${
          open ? "bg-white/5 text-[#adc6ff]" : "text-[#c2c6d6]"
        }`}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <UserCircle className="size-5" />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            type="button"
          />
          <div
            className={`${GLASS_CARD} absolute right-0 z-40 mt-2 w-56 rounded-xl bg-[#161d30]/95 p-1.5 shadow-xl backdrop-blur-xl`}
            role="menu"
          >
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold tracking-widest text-[#8c909f] uppercase">
                Signed in as
              </p>
              <p className="truncate text-sm font-semibold text-[#dae2fd]">
                {username}
              </p>
            </div>
            <div className="my-1 h-px bg-white/5" />
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#dae2fd] transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none"
              onClick={() => setOpen(false)}
              role="menuitem"
              title="Coming soon"
              type="button"
            >
              <User className="size-4 text-[#adc6ff]" />
              Profile
            </button>
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#dae2fd] transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none"
              onClick={() => setOpen(false)}
              role="menuitem"
              title="Coming soon"
              type="button"
            >
              <Settings className="size-4 text-[#adc6ff]" />
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}
