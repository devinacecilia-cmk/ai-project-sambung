// Simple localStorage-backed snapshot so the diagnostics page and the
// report issue dialog can read whatever the dashboard last measured.
// In a real app this would live in a database, not the browser.

export type NetworkStatus = "OPERATIONAL" | "DEGRADED" | "DISCONNECTED";
export type ServiceStatus = "CONNECTED" | "TIMEOUT" | "ERROR";

export interface SnapshotService {
  name: string;
  host: string;
  status: ServiceStatus;
  latency: number | null;
}

export interface DiagnosticsSnapshot {
  latency: number | null;
  download: number | null;
  upload: number | null;
  networkStatus: NetworkStatus;
  networkStatusMessage: string;
  services: SnapshotService[];
  scannedAt: string | null;
  lastHealthyAt: string | null;
}

const STORAGE_KEY = "sambung_diagnostics_snapshot";

const DEFAULT_SNAPSHOT: DiagnosticsSnapshot = {
  latency: null,
  download: null,
  upload: null,
  networkStatus: "OPERATIONAL",
  networkStatusMessage: "Run a scan to check real internet speed.",
  services: [],
  scannedAt: null,
  lastHealthyAt: null,
};

export function loadSnapshot(): DiagnosticsSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DiagnosticsSnapshot) : null;
  } catch {
    return null;
  }
}

// Merges into whatever is already stored so the ping-scan effect and the
// speed-test effect (which each only know half the snapshot) don't clobber
// each other's fields.
export function saveSnapshot(
  partial: Partial<DiagnosticsSnapshot>,
): DiagnosticsSnapshot {
  const current = loadSnapshot();
  const next: DiagnosticsSnapshot = {
    ...DEFAULT_SNAPSHOT,
    ...current,
    ...partial,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}
