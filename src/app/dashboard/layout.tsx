"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ScanProvider } from "@/components/dashboard/scan-provider";
import { ShaderBackground } from "@/components/dashboard/shader-background";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const AUTH_STORAGE_KEY = "nhm-auth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Reads a browser-only API, so this must stay in an effect: doing it
    // during render would render "authed" on the client but not on the
    // server and cause a hydration mismatch.
    if (window.localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthed(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("nhm-user");
    router.replace("/login");
  }

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-[#8c909f]">
        Loading...
      </main>
    );
  }

  const pulseStatus = pathname.startsWith("/dashboard/diagnostics")
    ? "critical"
    : "stable";

  return (
    <ScanProvider>
      <div className="isolate min-h-screen bg-[#020617] font-sans text-[#dae2fd]">
        <ShaderBackground />
        <Sidebar onLogout={handleLogout} pulseStatus={pulseStatus} />
        <Topbar />
        <main className="min-h-screen pt-24 pr-6 pb-24 lg:pr-8 lg:pb-8 lg:pl-72">
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
        <MobileNav />
      </div>
    </ScanProvider>
  );
}
