import type { PerformanceRange, PortfolioPerformanceRawResponse } from "@/services/api/stocks";

export type { PerformanceRange, PortfolioPerformanceRawResponse };

export interface PortfolioPerformancePointViewModel {
  name: string;
  portfolio: number;
  benchmark: number;
}

export interface PortfolioPerformanceSummaryViewModel {
  totalValue: number;
  valueDeltaPercent: number;
  totalGain: number;
  gainDeltaPercent: number;
  currency: string;
}

export interface PortfolioPerformanceViewModel {
  data: PortfolioPerformancePointViewModel[];
  summary: PortfolioPerformanceSummaryViewModel;
}
