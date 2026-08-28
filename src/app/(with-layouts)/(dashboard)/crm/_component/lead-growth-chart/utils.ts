import type { LeadGrowthRawResponse } from "@/services/api/crm";
import type { LeadGrowthSummary, LeadGrowthViewModel } from "./types";

export function mapLeadGrowthResponse(response: LeadGrowthRawResponse): LeadGrowthViewModel {
  return {
    data: response.data.map((point) => ({
      name: point.label,
      leads: point.leads.value,
      conversions: point.conversions.value,
    })),
    summary: {
      totalLeads: response.summary.total_leads,
      totalConversions: response.summary.total_conversions,
      leadsDeltaPercent: response.summary.leads_delta_percent,
      conversionRatePercent: response.summary.conversion_rate_percent,
      conversionRateDeltaPercent: response.summary.conversion_rate_delta_percent,
    },
  };
}

export function formatDelta(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getLeadGrowthStats(summary: LeadGrowthSummary) {
  return [
    {
      id: "leads",
      label: "Leads Generated",
      value: summary.totalLeads.toLocaleString(),
      delta: formatDelta(summary.leadsDeltaPercent),
      isPositive: summary.leadsDeltaPercent >= 0,
      dotClassName: "bg-brand-500",
    },
    {
      id: "conversion-rate",
      label: "Conversion Rate",
      value: `${summary.conversionRatePercent.toFixed(1)}%`,
      delta: formatDelta(summary.conversionRateDeltaPercent),
      isPositive: summary.conversionRateDeltaPercent >= 0,
      dotClassName: "bg-purple-500",
    },
  ];
}
