import { env } from "@/lib/env";
import type { NavItem } from "@/types/nav";

export const siteConfig = {
  name: "Sambung",
  description:
    "Sambung is a Network Health Monitor with real-time speed tests, latency checks, and connection diagnostics in one dashboard.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: "/og",
  author: "Open Source",
  mainNav: [
    { title: "Foundation", href: "#foundation" },
    { title: "Components", href: "https://ui.shadcn.com/docs/components" },
    { title: "Docs", href: "https://nextjs.org/docs" },
  ] satisfies NavItem[],
  links: {
    docs: "https://nextjs.org/docs",
    github: "https://github.com/devinaacs/next-starter-kit",
    shadcn: "https://ui.shadcn.com/",
  },
};
