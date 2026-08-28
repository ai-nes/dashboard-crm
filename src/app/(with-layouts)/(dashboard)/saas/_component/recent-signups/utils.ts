import { PLAN_NAME_MAP, STATUS_COLOR_MAP } from "./data";
import type { RecentSignupRawItem } from "@/services/api/saas";
import type { RecentSignupViewModel } from "./types";

export function formatJoinedDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMrr(value: number, currency: string): string {
  if (value === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toRecentSignupViewModel(raw: RecentSignupRawItem): RecentSignupViewModel {
  return {
    id: raw.id,
    repName: raw.rep_name,
    planName: PLAN_NAME_MAP[raw.plan_key] ?? raw.plan_key,
    status: formatStatusLabel(raw.status),
    statusColor: STATUS_COLOR_MAP[raw.status] ?? "gray",
    mrr: formatMrr(raw.mrr_amount, raw.mrr_currency),
    joined: formatJoinedDate(raw.joined_at),
  };
}
