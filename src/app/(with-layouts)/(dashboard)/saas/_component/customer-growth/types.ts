import type { CustomerGrowthRawResponse } from "@/services/api/saas";

export type { CustomerGrowthRawResponse };

export interface CustomerGrowthDataPoint {
  name: string;
  newSubscribers: number;
  churnedSubscribers: number;
  totalSubscribers: number;
}

export interface CustomerGrowthSummary {
  totalSubscribers: number;
  subscriberDeltaPercent: number;
  netNewSubscribers: number;
}

export interface CustomerGrowthViewModel {
  data: CustomerGrowthDataPoint[];
  summary: CustomerGrowthSummary;
}
