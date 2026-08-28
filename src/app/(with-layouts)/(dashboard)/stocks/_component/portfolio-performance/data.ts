import type { PortfolioPerformanceRawResponse } from "@/services/api/stocks";

import type { PortfolioPerformanceViewModel } from "./types";

export function mapPortfolioPerformanceResponse(
  response: PortfolioPerformanceRawResponse,
): PortfolioPerformanceViewModel {
  return {
    data: response.data.map((point) => ({
      name: point.label,
      portfolio: point.portfolio_value.value,
      benchmark: point.benchmark_value.value,
    })),
    summary: {
      totalValue: response.summary.total_value,
      valueDeltaPercent: response.summary.value_delta_percent,
      totalGain: response.summary.total_gain,
      gainDeltaPercent: response.summary.gain_delta_percent,
      currency: response.currency,
    },
  };
}
