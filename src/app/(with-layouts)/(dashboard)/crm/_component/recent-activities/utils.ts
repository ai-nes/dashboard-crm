import type { ActivityRawItem } from "@/services/api/crm";
import type { ActivityViewModel } from "./types";

export const SKELETON_ITEM_COUNT = 5;

export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  const then = new Date(isoString).getTime();
  const diffMs = now.getTime() - then;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function toActivityViewModel(
  raw: ActivityRawItem,
  now: Date = new Date(),
): ActivityViewModel {
  return {
    id: raw.id,
    type: raw.type,
    actorName: raw.actor_name,
    description: raw.description,
    relativeTime: formatRelativeTime(raw.created_at, now),
  };
}
