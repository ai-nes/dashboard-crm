import type { VisitorsAnalyticsRawResponse } from "@/services/api/analytics";

import type { VisitorsAnalyticsViewModel } from "./types";

export function mapVisitorsAnalyticsResponse(
  response: VisitorsAnalyticsRawResponse,
): VisitorsAnalyticsViewModel {
  return {
    data: response.data.map((point) => ({
      name: point.label,
      visitors: point.visitors.value,
      uniqueVisitors: point.unique_visitors.value,
    })),
    summary: {
      totalVisitors: response.summary.total_visitors,
      totalUniqueVisitors: response.summary.total_unique_visitors,
      visitorsDeltaPercent: response.summary.visitors_delta_percent,
      uniqueVisitorsDeltaPercent: response.summary.unique_visitors_delta_percent,
    },
  };
}
