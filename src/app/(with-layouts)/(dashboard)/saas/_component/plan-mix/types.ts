import type { PlanKey, PlanMixRawResponse } from "@/services/api/saas";

export type { PlanMixRawResponse };

export interface PlanMixSlice {
  id: string;
  planKey: PlanKey;
  name: string;
  subscribers: number;
  percentage: number;
  mrr: number;
  color: string;
}

export interface PlanMixViewModel {
  totalSubscribers: number;
  slices: PlanMixSlice[];
}
