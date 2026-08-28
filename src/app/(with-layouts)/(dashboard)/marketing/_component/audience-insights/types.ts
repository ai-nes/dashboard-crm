import type { AudienceInsightsRawResponse } from "@/services/api/marketing";

export type { AudienceInsightsRawResponse };

export interface AudienceSegmentViewModel {
  id: string;
  label: string;
  value: string;
  percentage: number;
}
