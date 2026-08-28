import type { LeadGrowthGranularity, LeadGrowthRawResponse } from "@/services/api/crm";

export type { LeadGrowthGranularity, LeadGrowthRawResponse };

export interface LeadGrowthChartPoint {
  name: string;
  leads: number;
  conversions: number;
}

export interface LeadGrowthSummary {
  totalLeads: number;
  totalConversions: number;
  leadsDeltaPercent: number;
  conversionRatePercent: number;
  conversionRateDeltaPercent: number;
}

export interface LeadGrowthViewModel {
  data: LeadGrowthChartPoint[];
  summary: LeadGrowthSummary;
}
