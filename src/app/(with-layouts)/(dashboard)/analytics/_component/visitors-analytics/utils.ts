import { formatNumber } from "@/utils/format-number";
import type { VisitorsSummary } from "./types";

export function formatDelta(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getVisitorsAnalyticsStats(summary: VisitorsSummary) {
  return [
    {
      id: "visitors",
      label: "Total Visitors",
      value: formatNumber({ value: summary.totalVisitors }),
      delta: formatDelta(summary.visitorsDeltaPercent),
      isPositive: summary.visitorsDeltaPercent >= 0,
      dotClassName: "bg-brand-500",
    },
    {
      id: "unique-visitors",
      label: "Unique Visitors",
      value: formatNumber({ value: summary.totalUniqueVisitors }),
      delta: formatDelta(summary.uniqueVisitorsDeltaPercent),
      isPositive: summary.uniqueVisitorsDeltaPercent >= 0,
      dotClassName: "bg-purple-500",
    },
  ];
}
