import formatCurrency from "@/utils/format-currency";
import type { PortfolioPerformanceSummaryViewModel } from "./types";

export function formatDelta(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getPortfolioPerformanceStats(summary: PortfolioPerformanceSummaryViewModel) {
  return [
    {
      id: "portfolio",
      label: "Portfolio Value",
      value: formatCurrency(summary.totalValue),
      delta: formatDelta(summary.valueDeltaPercent),
      isPositive: summary.valueDeltaPercent >= 0,
      dotClassName: "bg-brand-500",
    },
    {
      id: "gain",
      label: "Total Gain",
      value: formatCurrency(summary.totalGain),
      delta: formatDelta(summary.gainDeltaPercent),
      isPositive: summary.gainDeltaPercent >= 0,
      dotClassName: "bg-purple-500",
    },
  ];
}
