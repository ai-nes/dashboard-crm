import type { ChannelPerformanceRawResponse } from "@/services/api/marketing";

export type { ChannelPerformanceRawResponse };

export interface ChannelPerformanceViewModel {
  id: string;
  channel: string;
  spend: string;
  clicks: string;
  conversionRate: string;
  revenue: string;
}
