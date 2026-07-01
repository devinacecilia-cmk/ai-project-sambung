"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const SYSTEM_OPTIONS = [
  "SAP Server",
  "GL System",
  "Internet Gateway",
  "Database Cluster A",
  "Auth API",
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

type Urgency = (typeof URGENCY_OPTIONS)[number]["value"];

export function ReportIssueDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [system, setSystem] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = system !== "" && description.trim() !== "";

  function resetForm() {
    setSystem("");
    setDescription("");
    setUrgency("low");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Report submitted", {
        description: `The on-call team has been notified about ${system}.`,
      });
      setIsSubmitting(false);
      setOpen(false);
      resetForm();
    }, 600);
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
      open={open}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-[calc(100%-2rem)] gap-6 rounded-2xl border border-white/10 bg-[#0f172a]/90 p-8 text-[#dae2fd] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:max-w-2xl"
        showCloseButton={false}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h2 className="min-w-0 text-2xl font-semibold text-[#adc6ff]">
              Report a System Issue
            </h2>
            <DialogClose asChild>
              <button
                aria-label="Close"
                className="rounded-full p-1 text-[#c2c6d6] transition-colors hover:bg-white/5 hover:text-[#dae2fd]"
                type="button"
              >
                <X className="size-5" />
              </button>
            </DialogClose>
          </div>
          <p className="text-[#c2c6d6]">
            Your system diagnostics will be automatically attached.
          </p>
        </div>

        <form className="flex min-w-0 flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold tracking-widest text-[#c2c6d6] uppercase"
              htmlFor="report-system"
            >
              What system is affected?
            </label>
            <div className="relative">
              <select
                className="w-full cursor-pointer appearance-none rounded-t-lg border-b-2 border-[#424754] bg-[#1e293b]/60 px-4 py-3 text-[#dae2fd] transition-all focus:border-[#adc6ff] focus:ring-0 focus:outline-none"
                id="report-system"
                onChange={(event) => setSystem(event.target.value)}
                value={system}
              >
                <option value="">Select a system...</option>
                {SYSTEM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#c2c6d6]" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold tracking-widest text-[#c2c6d6] uppercase"
              htmlFor="report-description"
            >
              Describe the problem
            </label>
            <textarea
              className="w-full resize-none rounded-t-lg border-b-2 border-[#424754] bg-[#1e293b]/60 px-4 py-3 text-[#dae2fd] transition-all placeholder:text-[#8c909f]/50 focus:border-[#adc6ff] focus:ring-0 focus:outline-none"
              id="report-description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Please provide specific error codes or symptoms..."
              rows={3}
              value={description}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-[#c2c6d6] uppercase">
              Urgency
            </span>
            <div className="flex w-full rounded-xl border border-white/5 bg-[#2d3449]/50 p-1">
              {URGENCY_OPTIONS.map(({ value, label }) => (
                <button
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    urgency === value
                      ? "bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : "text-[#c2c6d6] hover:text-[#dae2fd]"
                  }`}
                  key={value}
                  onClick={() => setUrgency(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="size-5 animate-pulse" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-bold text-emerald-400">
                  Auto-captured Diagnostics
                </span>
                <div className="flex flex-wrap gap-x-3 font-mono text-xs text-[#c2c6d6]/80">
                  <span>TS: 14:02:11</span>
                  <span>IP: 192.168.1.104</span>
                  <span className="text-emerald-400/80">Err: 503_FAIL</span>
                </div>
              </div>
            </div>
            <button
              className="shrink-0 text-sm font-bold text-[#adc6ff] transition-all hover:underline"
              title="Coming soon"
              type="button"
            >
              View Logs
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <DialogClose asChild>
              <button
                className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-[#dae2fd] transition-all hover:bg-white/5"
                type="button"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              className="rounded-full bg-[#adc6ff] px-6 py-2.5 text-sm font-bold text-[#00285d] shadow-lg shadow-[#adc6ff]/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSubmit || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
