"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  loadSnapshot,
  type DiagnosticsSnapshot,
} from "@/lib/diagnostics-store";
import { saveReport, type ReportUrgency } from "@/lib/reports-store";

const FALLBACK_SYSTEM_OPTIONS = [
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
] as const satisfies { value: ReportUrgency; label: string }[];

export function ReportIssueDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<DiagnosticsSnapshot | null>(null);
  const [system, setSystem] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<ReportUrgency>("low");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemError, setSystemError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  useEffect(() => {
    // Reads localStorage, so this must stay in an effect rather than render.
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSnap(loadSnapshot());
    }
  }, [open]);

  const failedServices =
    snap?.services.filter((service) => service.status !== "CONNECTED") ?? [];
  const failedCount = failedServices.length;

  const descriptionLength = description.length;
  const counterColor =
    descriptionLength >= 480
      ? "text-red-400"
      : descriptionLength > 400
        ? "text-amber-400"
        : "text-[#8c909f]";

  const autoCapture = {
    timestamp: snap?.scannedAt
      ? new Date(snap.scannedAt).toTimeString().slice(0, 8)
      : "--:--:--",
    failedEndpoints:
      failedServices.map((service) => service.ip).join(", ") || "None",
    errorCode:
      snap?.networkStatus === "DISCONNECTED"
        ? "NET_UNREACHABLE"
        : snap?.networkStatus === "DEGRADED"
          ? "HIGH_LATENCY"
          : failedServices.length > 0
            ? "SERVICE_UNREACHABLE"
            : "NONE",
    latency: snap?.latency ?? null,
    download: snap?.download ?? null,
    upload: snap?.upload ?? null,
  };

  const dropdownOptions =
    snap && snap.services.length > 0
      ? snap.services.map((service) => ({
          value: service.name,
          label: `${service.name} (${service.ip})`,
        }))
      : FALLBACK_SYSTEM_OPTIONS.map((name) => ({ value: name, label: name }));

  function resetForm() {
    setSystem("");
    setDescription("");
    setUrgency("low");
    setSystemError("");
    setDescriptionError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSystemError =
      system === "" ? "Please select an affected system." : "";
    const nextDescriptionError =
      description.trim() === ""
        ? "Please describe the problem before submitting."
        : "";
    setSystemError(nextSystemError);
    setDescriptionError(nextDescriptionError);
    if (nextSystemError || nextDescriptionError) return;

    setIsSubmitting(true);

    setTimeout(() => {
      saveReport({ system, description, urgency, autoCapture });
      toast.success("Report submitted", {
        description: `The on-call team has been notified about ${system}.`,
      });
      setIsSubmitting(false);
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
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
                className={`w-full cursor-pointer appearance-none rounded-t-lg border-b-2 bg-[#1e293b]/60 px-4 py-3 text-[#dae2fd] transition-all focus:ring-0 focus:outline-none ${
                  systemError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#424754] focus:border-[#adc6ff]"
                }`}
                id="report-system"
                onChange={(event) => {
                  setSystem(event.target.value);
                  setSystemError("");
                }}
                value={system}
              >
                <option value="">Select a system...</option>
                {dropdownOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="other">Other / Unknown</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#c2c6d6]" />
            </div>
            {systemError ? (
              <p className="text-xs font-medium text-red-400">{systemError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold tracking-widest text-[#c2c6d6] uppercase"
              htmlFor="report-description"
            >
              Describe the problem
            </label>
            <textarea
              className={`w-full resize-none rounded-t-lg border-b-2 bg-[#1e293b]/60 px-4 py-3 text-[#dae2fd] transition-all placeholder:text-[#8c909f]/50 focus:ring-0 focus:outline-none ${
                descriptionError
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#424754] focus:border-[#adc6ff]"
              }`}
              id="report-description"
              maxLength={500}
              onChange={(event) => {
                setDescription(event.target.value);
                setDescriptionError("");
              }}
              placeholder="Please provide specific error codes or symptoms..."
              rows={3}
              value={description}
            />
            <div className="flex items-center justify-between gap-4">
              {descriptionError ? (
                <p className="text-xs font-medium text-red-400">
                  {descriptionError}
                </p>
              ) : (
                <span />
              )}
              <span className={`text-xs font-medium tabular-nums ${counterColor}`}>
                {descriptionLength} / 500
              </span>
            </div>
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
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[#c2c6d6]/80">
                  <span>Captured at {autoCapture.timestamp}</span>
                  <span aria-hidden>·</span>
                  <span
                    className={
                      failedCount > 0
                        ? "text-[#ffb4ab]/90"
                        : "text-emerald-400/80"
                    }
                  >
                    {failedCount > 0
                      ? `${failedCount} service${failedCount === 1 ? "" : "s"} failed`
                      : "All services OK"}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    ↓{autoCapture.download ?? "--"} Mbps ↑
                    {autoCapture.upload ?? "--"} Mbps
                  </span>
                  <span aria-hidden>·</span>
                  <span>Ping: {autoCapture.latency ?? "--"}ms</span>
                  {autoCapture.errorCode !== "NONE" ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="text-[#ffb4ab]/90">
                        Err: {autoCapture.errorCode}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              className="shrink-0 cursor-not-allowed text-sm font-bold text-[#adc6ff] opacity-50"
              disabled
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
              className={`rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                urgency === "critical"
                  ? "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700"
                  : "bg-[#adc6ff] text-[#00285d] shadow-[#adc6ff]/20"
              }`}
              disabled={isSubmitting}
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
