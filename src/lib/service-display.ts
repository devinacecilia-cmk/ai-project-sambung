import type { ComponentType } from "react";
import { Cloud, Globe, Router, ShieldBan, ShieldCheck } from "lucide-react";

import type { ServiceStatus } from "@/lib/diagnostics-store";

export const SERVICE_ICONS: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  "Google Public DNS": Globe,
  Cloudflare: Cloud,
  Quad9: ShieldCheck,
  OpenDNS: Router,
  "AdGuard DNS": ShieldBan,
};

export function getServiceIcon(
  name: string,
): ComponentType<{ className?: string }> {
  return SERVICE_ICONS[name] ?? Globe;
}

export type ServiceTone = "success" | "warning" | "error";

export function toneForServiceStatus(status: ServiceStatus): ServiceTone {
  if (status === "CONNECTED") return "success";
  if (status === "TIMEOUT") return "warning";
  return "error";
}
