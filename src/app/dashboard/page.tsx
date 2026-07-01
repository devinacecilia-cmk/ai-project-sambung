"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const AUTH_STORAGE_KEY = "nhm-auth";

export default function DashboardPage() {
  const router = useRouter();
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
    router.replace("/login");
  }

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1326] text-[#8c909f]">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1326] px-6 py-10 text-[#dae2fd]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#adc6ff]">
            Network Health Monitor
          </h1>
          <p className="mt-1 text-sm text-[#8c909f]">
            Signed in as <span className="text-[#dae2fd]">admin</span>
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-[#dae2fd] transition hover:bg-white/[0.05]"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-5xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] py-24 text-center">
        <p className="text-sm tracking-widest text-[#8c909f] uppercase">
          Coming next
        </p>
        <p className="mt-2 text-lg text-[#dae2fd]">
          Dashboard screens go here.
        </p>
      </div>
    </main>
  );
}
