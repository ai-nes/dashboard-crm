import type { MarketNewsRawItem } from "@/services/api/stocks";
import type { MarketNewsItemViewModel } from "./types";

export const SKELETON_ROW_COUNT = 5;

export function formatRelativeTime(isoString: string): string {
  const now = new Date("2026-08-28T08:00:00.000Z");
  const published = new Date(isoString);
  const diffMs = now.getTime() - published.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

export function mapMarketNewsItem(raw: MarketNewsRawItem): MarketNewsItemViewModel {
  return {
    id: raw.id,
    headline: raw.headline,
    source: raw.source,
    time: formatRelativeTime(raw.published_at),
    url: raw.url,
  };
}
