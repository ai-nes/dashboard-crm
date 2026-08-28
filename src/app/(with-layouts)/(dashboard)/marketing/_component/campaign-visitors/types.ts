import type { CampaignVisitorsRawResponse } from "@/services/api/marketing";

export type { CampaignVisitorsRawResponse };

export interface CampaignVisitorsDataPoint {
  name: string;
  email: number;
  social: number;
  search: number;
  referral: number;
}

export interface CampaignVisitorsSummary {
  totalVisitors: number;
  deltaPercent: number;
}

export interface CampaignVisitorsViewModel {
  data: CampaignVisitorsDataPoint[];
  summary: CampaignVisitorsSummary;
}
