import type { VisitorsAnalyticsRawResponse } from "@/services/api/analytics";

export type { VisitorsAnalyticsRawResponse };

export interface VisitorsChartDataPoint {
  name: string;
  visitors: number;
  uniqueVisitors: number;
}

export interface VisitorsSummary {
  totalVisitors: number;
  totalUniqueVisitors: number;
  visitorsDeltaPercent: number;
  uniqueVisitorsDeltaPercent: number;
}

export interface VisitorsAnalyticsViewModel {
  data: VisitorsChartDataPoint[];
  summary: VisitorsSummary;
}
