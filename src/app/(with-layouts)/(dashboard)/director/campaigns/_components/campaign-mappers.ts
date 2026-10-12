import type { LeadSaleCampaign } from "@/services/api/lead-sale";

import { campaignStatusOptions } from "./mappings";
import type { CampaignListItem, CampaignStatus } from "./types";
import type { ChannelTypeValue } from "./channel-types";

function normalizeCampaignStatus(value: string): CampaignStatus | "" {
  const normalized = value.trim().toUpperCase();
  return campaignStatusOptions.find((status) => status === normalized) ?? "";
}

function normalizeCampaignMode(boundary: string | null | undefined) {
  const normalized = boundary?.trim().toLowerCase();
  if (normalized === "digital") return "ONLINE" as const;
  if (normalized === "field") return "OFFLINE" as const;
  return "" as const;
}

export function toCampaignListItem(
  campaign: LeadSaleCampaign,
): CampaignListItem {
  const stableCode = campaign.stableCode.trim();
  const title = campaign.title.trim();
  const startDate = campaign.startDate ?? "";
  const endDate = campaign.endDate ?? "";
  const status = normalizeCampaignStatus(campaign.status);

  return {
    id: campaign.name,
    code: stableCode,
    name: title || "Chiến dịch chưa có tên",
    admissionYear: campaign.admissionYear ?? null,
    startDate,
    endDate,
    status,
    mode: normalizeCampaignMode(campaign.channelBoundary),
    channelType: (campaign.channelType ?? "") as ChannelTypeValue | "",
    channelUrl: campaign.channelUrl ?? "",
    campus: campaign.campus ?? "",
    leadRoutingEnabled: campaign.leadRoutingEnabled ?? false,
    leadRoutingTargetType: campaign.leadRoutingTargetType ?? "",
    leadRoutingTargetTeam: campaign.leadRoutingTargetTeam ?? "",
    leadRoutingTargetGroup: campaign.leadRoutingTargetGroup ?? "",
  };
}
