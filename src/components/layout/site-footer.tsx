import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>{siteConfig.name}</p>
        <p>Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.</p>
      </div>
    </footer>
  );
}
