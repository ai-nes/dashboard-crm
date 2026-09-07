import type { LeadSaleCampaign } from "@/services/api/lead-sale";

import { campaignStatusOptions } from "./mappings";
import type { CampaignListItem, CampaignStatus } from "./types";
import type { ChannelTypeValue } from "./channel-types";

export function toCampaignListItem(
  campaign: LeadSaleCampaign,
): CampaignListItem {
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
    code: campaign.stableCode || campaign.name,
    name: campaign.title || campaign.name,
    admissionYear,
    startDate,
    endDate,
    status,
    mode: campaign.channelBoundary === "Digital" ? "ONLINE" : "OFFLINE",
    channelType: (campaign.channelType ?? "") as ChannelTypeValue | "",
    channelUrl: campaign.channelUrl ?? "",
  };
}
