import type { WeeklyAiActivityRawResponse } from "@/services/api/ai";

export type { WeeklyAiActivityRawResponse };

export interface WeeklyActivityDataPoint {
  name: string;
  requests: number;
}

export interface WeeklyActivitySummary {
  totalRequests: number;
  requestsDeltaPercent: number;
}

export interface WeeklyActivityViewModel {
  data: WeeklyActivityDataPoint[];
  summary: WeeklyActivitySummary;
}
