import type { ReactNode } from "react";

export interface AdminOverviewLink {
  label: string;
  description: string;
  href: string;
}

export type AdminOverviewStatus = "ready" | "empty" | "loading" | "error";

export interface AdminOverviewModule {
  label: string;
  description: string;
  value: string;
  detail: string;
  status: AdminOverviewStatus;
  icon: ReactNode;
}

export interface AdminOverviewVolume {
  label: string;
  value: number;
  color: string;
}
