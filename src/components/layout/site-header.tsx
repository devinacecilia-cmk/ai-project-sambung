import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm">
            D
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="text-muted-foreground hidden items-center gap-6 text-sm sm:flex">
          {siteConfig.mainNav.map((item) => (
            <a
              className="hover:text-foreground transition"
              href={item.href}
              key={item.href}
            >
              {item.title}
            </a>
          ))}
        </nav>
        <Button asChild size="icon" variant="ghost">
          <a aria-label="Open repository" href={siteConfig.links.github}>
            <ExternalLinkIcon className="size-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
