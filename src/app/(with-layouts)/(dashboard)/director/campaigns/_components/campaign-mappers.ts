import type { LeadSaleCampaign } from "@/services/api/lead-sale";

import { campaignStatusOptions } from "./mappings";
import type { CampaignListItem, CampaignStatus } from "./types";
import type { ChannelTypeValue } from "./channel-types";

export function toCampaignListItem(
  campaign: LeadSaleCampaign,
): CampaignListItem {
  const stableCode = campaign.stableCode.trim();
  const title = campaign.title.trim();
  const startDate = campaign.startDate ?? "";
  const endDate = campaign.endDate ?? "";
  const admissionYear =
    Number(startDate.slice(0, 4)) || new Date().getFullYear();
  const status = campaignStatusOptions.includes(
    campaign.status as CampaignStatus,
  )
    ? (campaign.status as CampaignStatus)
    : "DRAFT";

  return {
    id: campaign.name,
    code: stableCode,
    name: title || "Chiến dịch chưa có tên",
    admissionYear,
    startDate,
    endDate,
    status,
    mode: campaign.channelBoundary === "Digital" ? "ONLINE" : "OFFLINE",
    channelType: (campaign.channelType ?? "") as ChannelTypeValue | "",
    channelUrl: campaign.channelUrl ?? "",
    campus: campaign.campus ?? "",
    leadRoutingEnabled: campaign.leadRoutingEnabled ?? false,
    leadRoutingTargetType: campaign.leadRoutingTargetType ?? "",
    leadRoutingTargetTeam: campaign.leadRoutingTargetTeam ?? "",
    leadRoutingTargetGroup: campaign.leadRoutingTargetGroup ?? "",
  };
}
