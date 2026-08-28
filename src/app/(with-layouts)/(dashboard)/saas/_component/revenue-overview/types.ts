import type { RevenueOverviewRawResponse } from "@/services/api/saas";

export type { RevenueOverviewRawResponse };

export interface RevenueOverviewDataPoint {
  name: string;
  revenue: number;
  mrr: number;
}

export interface RevenueOverviewSummary {
  totalRevenue: number;
  revenueDeltaPercent: number;
  currentMrr: number;
  mrrDeltaPercent: number;
}

export interface RevenueOverviewViewModel {
  data: RevenueOverviewDataPoint[];
  summary: RevenueOverviewSummary;
}
