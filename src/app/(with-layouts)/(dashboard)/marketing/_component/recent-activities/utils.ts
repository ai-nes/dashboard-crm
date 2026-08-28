import { activityDisplayConfig } from "./data";
import type { RecentActivityRawItem } from "@/services/api/marketing";

import type { ActivityViewModel } from "./types";

export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(isoString).getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function toActivityViewModel(
  raw: RecentActivityRawItem,
  now: Date = new Date(),
): ActivityViewModel {
  const display = activityDisplayConfig[raw.type];

  return {
    id: raw.id,
    description: raw.description,
    actor: raw.actor_name,
    relativeTime: formatRelativeTime(raw.created_at, now),
    icon: display.icon,
    iconBgClass: display.iconBgClass,
    iconColorClass: display.iconColorClass,
  };
}
