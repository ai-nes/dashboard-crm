import type { WeeklyAiActivityRawResponse } from "@/services/api/ai";

import type { WeeklyActivityViewModel } from "./types";

export function mapWeeklyAiActivityResponse(
  response: WeeklyAiActivityRawResponse,
): WeeklyActivityViewModel {
  return {
    data: response.data.map((point) => ({
      name: point.day_label,
      requests: point.requests,
    })),
    summary: {
      totalRequests: response.summary.total_requests,
      requestsDeltaPercent: response.summary.requests_delta_percent,
    },
  };
}
