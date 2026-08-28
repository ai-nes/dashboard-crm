import type { SalesRepRawItem } from "@/services/api/crm";
import type { PerformanceLevel, SalesRepViewModel } from "./types";

export const SKELETON_ROW_COUNT = 6;

export function getPerformanceLevel(percent: number): PerformanceLevel {
  if (percent >= 90) return "excellent";
  if (percent >= 65) return "good";
  return "at-risk";
}

export function formatRevenue(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function toSalesRepViewModel(raw: SalesRepRawItem): SalesRepViewModel {
  return {
    id: raw.id,
    repName: raw.rep_name,
    avatarInitials: raw.avatar_initials,
    dealsClosed: raw.deals_closed,
    revenue: formatRevenue(raw.revenue.value, raw.revenue.currency_code),
    performancePercent: raw.performance_percent,
    performanceLevel: getPerformanceLevel(raw.performance_percent),
  };
}

export const PERFORMANCE_BAR_COLOR: Record<PerformanceLevel, string> = {
  excellent: "var(--color-green-600)",
  good: "var(--color-brand-500)",
  "at-risk": "var(--color-red-600)",
};
