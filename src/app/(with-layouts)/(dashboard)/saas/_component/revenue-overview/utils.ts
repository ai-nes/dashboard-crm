import formatCurrency from "@/utils/format-currency";
import type { RevenueOverviewRawResponse, RevenueOverviewViewModel } from "./types";

export function mapRevenueOverviewResponse(
  raw: RevenueOverviewRawResponse,
): RevenueOverviewViewModel {
  return {
    data: raw.data.map((point) => ({
      name: point.label,
      revenue: point.revenue.value,
      mrr: point.mrr.value,
    })),
    summary: {
      totalRevenue: raw.summary.total_revenue,
      revenueDeltaPercent: raw.summary.revenue_delta_percent,
      currentMrr: raw.summary.current_mrr,
      mrrDeltaPercent: raw.summary.mrr_delta_percent,
    },
  };
}

export function formatDelta(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getRevenueOverviewStats(summary: RevenueOverviewViewModel["summary"]) {
  return [
    {
      id: "revenue",
      label: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      delta: formatDelta(summary.revenueDeltaPercent),
      isPositive: summary.revenueDeltaPercent >= 0,
      dotClassName: "bg-brand-500",
    },
    {
      id: "mrr",
      label: "Current MRR",
      value: formatCurrency(summary.currentMrr),
      delta: formatDelta(summary.mrrDeltaPercent),
      isPositive: summary.mrrDeltaPercent >= 0,
      dotClassName: "bg-purple-500",
    },
  ];
}
