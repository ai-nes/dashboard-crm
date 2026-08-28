import type { RecentActivityRawItem } from "@/services/api/ai";

import type { RecentActivityViewModel } from "./types";

export function formatRelativeTime(fromIso: string, nowIso: string): string {
  const from = new Date(fromIso).getTime();
  const now = new Date(nowIso).getTime();
  const diffMs = Math.max(now - from, 0);
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function toRecentActivityViewModel(
  raw: RecentActivityRawItem,
  nowIso: string,
): RecentActivityViewModel {
  return {
    id: raw.id,
    type: raw.activity_type,
    title: raw.title,
    description: raw.description,
    relativeTime: formatRelativeTime(raw.created_at, nowIso),
  };
}
