// Simple localStorage-backed report log so submitted issues show up in
// System History. In a real app this would be a database write.

export type ReportUrgency = "low" | "medium" | "high" | "critical";

export interface ReportAutoCapture {
  timestamp: string;
  failedEndpoints: string;
  errorCode: string;
  latency: number | null;
  download: number | null;
  upload: number | null;
}

export interface Report {
  id: string;
  system: string;
  description: string;
  urgency: ReportUrgency;
  autoCapture: ReportAutoCapture;
  submittedAt: string;
  status: "Open";
}

const STORAGE_KEY = "sambung_reports";

export function loadReports(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

export function saveReport(
  report: Omit<Report, "id" | "submittedAt" | "status">,
): Report {
  const newReport: Report = {
    ...report,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `report-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    submittedAt: new Date().toISOString(),
    status: "Open",
  };

  if (typeof window !== "undefined") {
    const reports = loadReports();
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }

  return newReport;
}
