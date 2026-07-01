"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, IdCard, Loader2, Lock, LogIn } from "lucide-react";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "123";
const AUTH_STORAGE_KEY = "nhm-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    setTimeout(() => {
      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
        router.push("/dashboard");
        return;
      }
      setError("Invalid username or password.");
      setIsSubmitting(false);
    }, 500);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b1326] px-5 py-16 text-[#dae2fd]">
      <div className="pointer-events-none fixed -top-[10%] -left-[10%] size-[50vw] rounded-full bg-[#adc6ff]/10 blur-[150px]" />
      <div className="pointer-events-none fixed -right-[10%] -bottom-[10%] size-[60vw] rounded-full bg-[#3131c0]/10 blur-[150px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="px-8 pt-8 pb-6 text-center">
            <h1 className="mb-2 text-3xl font-black tracking-[0.4em] text-[#adc6ff] uppercase">
              SAMBUNG
            </h1>
            <p className="text-[11px] tracking-[0.2em] text-[#8c909f] uppercase opacity-80">
              Network Health Monitor
            </p>
          </div>

          <form className="space-y-5 px-8 pb-8" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="block pl-1 text-xs font-semibold tracking-widest text-[#8c909f] uppercase"
                htmlFor="username"
              >
                Username
              </label>
              <div className="group flex items-center rounded-xl border border-white/5 bg-white/[0.02] transition focus-within:bg-white/[0.03] focus-within:shadow-[inset_0_0_0_1px_rgba(173,198,255,0.2)]">
                <IdCard className="ml-4 size-4 shrink-0 text-[#8c909f]/60 transition-colors group-focus-within:text-[#adc6ff]" />
                <input
                  autoComplete="username"
                  className="w-full bg-transparent px-3 py-[18px] text-sm text-[#dae2fd] placeholder:text-[#8c909f]/40 focus:outline-none"
                  id="username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin"
                  type="text"
                  value={username}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block pl-1 text-xs font-semibold tracking-widest text-[#8c909f] uppercase"
                htmlFor="password"
              >
                Password
              </label>
              <div className="group flex items-center rounded-xl border border-white/5 bg-white/[0.02] transition focus-within:bg-white/[0.03] focus-within:shadow-[inset_0_0_0_1px_rgba(173,198,255,0.2)]">
                <Lock className="ml-4 size-4 shrink-0 text-[#8c909f]/60 transition-colors group-focus-within:text-[#adc6ff]" />
                <input
                  autoComplete="current-password"
                  className="w-full bg-transparent px-3 py-[18px] text-sm text-[#dae2fd] placeholder:text-[#8c909f]/40 focus:outline-none"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="mr-4 shrink-0 cursor-pointer text-[#8c909f]/60 transition-colors hover:text-[#dae2fd]"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-[#93000a]/40 bg-[#93000a]/10 px-3 py-2 text-xs text-[#ffb4ab]">
                {error}
              </p>
            )}

            <button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] py-3.5 text-sm font-semibold text-[#002e6a] shadow-[0_4px_15px_rgba(0,90,194,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(0,90,194,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  Authorizing...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Sign In
                  <LogIn className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-8 py-4">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold tracking-widest text-emerald-500/90 uppercase">
                Systems Operational
              </span>
            </div>
            <span className="text-[10px] tracking-widest text-[#8c909f]/40 tabular-nums">
              v1.0.0
            </span>
          </div>
        </div>

        <p className="mt-6 px-4 text-center text-xs leading-relaxed text-[#8c909f]/40">
          Authorized personnel only. All access is monitored.
        </p>
      </div>
    </main>
  );
}
