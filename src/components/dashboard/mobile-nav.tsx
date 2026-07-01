"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, HeartPulse, Megaphone, User } from "lucide-react";

const MOBILE_NAV_ITEMS: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string | null;
}[] = [
  { icon: HeartPulse, label: "Status", href: "/dashboard" },
  { icon: BookOpen, label: "Guide", href: "/dashboard/troubleshoot" },
  { icon: Megaphone, label: "Report", href: null },
  { icon: User, label: "Me", href: null },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-[#2d3449]/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
      {MOBILE_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const active = href ? pathname === href : false;
        const className = `flex flex-col items-center justify-center ${
          active ? "text-[#adc6ff]" : "text-[#c2c6d6]"
        }`;
        const content = (
          <>
            <Icon className="size-6" />
            <span className="mt-1 text-[10px] font-bold tracking-wider uppercase">
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
  );
}
