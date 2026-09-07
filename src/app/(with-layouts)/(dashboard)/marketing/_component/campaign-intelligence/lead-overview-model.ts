import type {
  CampaignRecord,
  LeadQualityGroup,
  LeadStatusFilter,
  LeadStatusGroup,
} from "@/services/api/campaign-intelligence";

export const LEAD_STATUS_GROUPS = [
  { code: "new", label: "Mới", color: "var(--info-500)" },
  { code: "in_progress", label: "Đang xử lý", color: "var(--primary-500)" },
  { code: "no_response", label: "Chưa kết nối", color: "var(--warning-500)" },
  { code: "disqualified", label: "Không phù hợp", color: "var(--error-500)" },
  { code: "converted", label: "Đã chuyển đổi", color: "var(--success-500)" },
] as const satisfies ReadonlyArray<{ code: LeadStatusGroup; label: string; color: string }>;

export const LEAD_QUALITY_GROUPS = [
  { code: "invalid", label: "Sai số", color: "var(--error-500)" },
  { code: "duplicate", label: "Lead trùng", color: "var(--warning-500)" },
  { code: "unknown", label: "Chưa phân loại", color: "var(--gray-500)" },
] as const satisfies ReadonlyArray<{ code: LeadQualityGroup; label: string; color: string }>;

export function leadStatusCount(campaign: CampaignRecord, code: LeadStatusGroup) {
  if (campaign.statusBreakdown === null) return null;
  return campaign.statusBreakdown.find((item) => item.code === code)?.count ?? 0;
}

export function buildLeadOverview(campaigns: CampaignRecord[], limit: number) {
  const available = campaigns.every((campaign) => campaign.leadCount !== null && campaign.statusBreakdown !== null);
  const rows = [...campaigns]
    .sort((a, b) => (b.leadCount ?? 0) - (a.leadCount ?? 0) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((campaign) => ({
      campaign,
      id: campaign.id,
      name: campaign.name,
      ...Object.fromEntries(LEAD_STATUS_GROUPS.map(({ code }) => [code, leadStatusCount(campaign, code) ?? 0])),
    }));
  const total = campaigns.reduce((sum, campaign) => sum + (campaign.leadCount ?? 0), 0);
  const groups = Object.fromEntries(LEAD_STATUS_GROUPS.map(({ code }) => [code,
    campaigns.reduce((sum, campaign) => sum + (leadStatusCount(campaign, code) ?? 0), 0),
  ])) as Record<LeadStatusGroup, number>;
  return { available, rows, total, groups, ungrouped: total - Object.values(groups).reduce((sum, count) => sum + count, 0) };
}

export type CampaignLeadSelection = {
  campaign: CampaignRecord;
  statusGroup?: Exclude<LeadStatusFilter, "all">;
};
