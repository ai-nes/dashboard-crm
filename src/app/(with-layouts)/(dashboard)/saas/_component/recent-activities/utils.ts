import type { ActivityType, RecentActivityRawItem } from "@/services/api/saas";
import type { RecentActivityViewModel } from "./types";

export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  const target = new Date(isoString);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.round(diffDays / 7);
  return `${diffWeeks}w ago`;
}

export const ACTIVITY_LABEL_MAP: Record<ActivityType, string> = {
  new_signup: "New Signup",
  upgrade: "Upgrade",
  downgrade: "Downgrade",
  cancellation: "Cancellation",
  payment_failed: "Payment Failed",
  trial_started: "Trial Started",
};

export function toRecentActivityViewModel(
  raw: RecentActivityRawItem,
  now?: Date,
): RecentActivityViewModel {
  return {
    id: raw.id,
    actorName: raw.actor_name,
    activityType: raw.activity_type,
    description: raw.description,
    relativeTime: formatRelativeTime(raw.created_at, now),
  };
}
