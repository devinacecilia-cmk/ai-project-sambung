import {
  ArrowRightIcon,
  BookOpenIcon,
  Code2Icon,
  GitBranchIcon,
  TerminalIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";

export const metadata = createMetadata("/");

const installCommand =
  "git clone https://github.com/devinaacs/next-starter-kit.git my-app && cd my-app && cp .env.example .env.local && npm install";

export default function Home() {
  return (
    <main className="grow overflow-hidden bg-brand-bg px-5 py-8 text-brand-fg sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center">
        <div className="hero-frame relative w-full overflow-hidden border border-brand-accent/70 bg-brand-surface shadow-2xl shadow-black">
          <div className="hero-grid absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.35),rgba(5,5,5,0.78))]" />

          <span className="hero-corner absolute top-0 left-0 h-16 w-16 border-t-2 border-l-2 border-brand-accent" />
          <span className="hero-corner absolute top-0 right-0 h-16 w-16 border-t-2 border-r-2 border-brand-accent" />
          <span className="hero-corner absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-brand-accent" />
          <span className="hero-corner absolute right-0 bottom-0 h-16 w-16 border-r-2 border-b-2 border-brand-accent" />

          <div className="relative mx-auto flex min-h-[560px] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center sm:px-10 lg:px-16">
            <div className="hero-fade-up mb-8 inline-flex items-center gap-2 border border-brand-accent/30 bg-black/35 px-5 py-3 text-xs font-bold tracking-[0.28em] text-brand-accent uppercase">
              <Code2Icon className="size-4" />
              Open source
            </div>

            <div className="hero-fade-up hero-delay-100 space-y-5">
              <p className="text-xs font-semibold tracking-[0.24em] text-brand-accent/80 uppercase sm:text-sm">
                {siteConfig.name}
              </p>
              <h1 className="mx-auto max-w-6xl font-serif text-[3.5rem] leading-[0.94] font-black tracking-normal text-balance sm:text-[4.75rem] lg:text-[5.25rem] xl:text-[5.625rem]">
                Start building today
              </h1>
              <p className="mx-auto max-w-3xl text-base leading-7 text-brand-muted sm:text-lg sm:leading-8">
                Clone the repository, install dependencies, and start shipping.
                It&apos;s that simple. No configuration, no hassle.
              </p>
            </div>

            <div className="hero-fade-up hero-delay-200 mt-8 flex w-full max-w-xl flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                className="h-14 rounded-none bg-brand-accent px-8 text-base font-bold text-black transition-transform hover:-translate-y-0.5 hover:bg-brand-accent-hover"
              >
                <a href={siteConfig.links.github}>
                  <GitBranchIcon className="size-5" />
                  View on GitHub
                </a>
              </Button>
              <Button
                asChild
                className="h-14 rounded-none border-brand-fg/25 bg-black/20 px-8 text-base font-bold text-brand-fg transition-transform hover:-translate-y-0.5 hover:bg-brand-fg/10 hover:text-brand-fg"
                variant="outline"
              >
                <a href={siteConfig.links.docs}>
                  <BookOpenIcon className="size-5" />
                  Documentation
                  <ArrowRightIcon className="size-5" />
                </a>
              </Button>
            </div>

            <div className="hero-fade-up hero-delay-300 mt-12 h-px w-full max-w-4xl bg-brand-fg/15" />

            <div className="hero-fade-up hero-delay-400 mt-8 flex w-full max-w-4xl items-start gap-4 border border-brand-accent/25 bg-black/45 px-4 py-4 text-left shadow-xl shadow-black/40 sm:px-5">
              <TerminalIcon className="mt-0.5 size-5 shrink-0 text-brand-accent" />
              <code className="min-w-0 font-mono text-xs leading-6 [overflow-wrap:anywhere] whitespace-normal text-brand-accent select-text sm:text-sm lg:text-base">
                {installCommand}
              </code>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
