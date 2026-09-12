import { CAMPAIGN_STATUS_LABEL } from "@/services/api/campaigns";
import type { CampaignMode, CampaignStatus } from "./types";

export const campaignStatusLabel: Record<CampaignStatus, string> =
  CAMPAIGN_STATUS_LABEL;

export const campaignStatusColor: Record<
  CampaignStatus,
  "gray" | "sky" | "success" | "warning"
> = {
  DRAFT: "gray",
  UPCOMING: "sky",
  ACTIVE: "success",
  CLOSED: "warning",
};

export const campaignStatusOptions: CampaignStatus[] = [
  "DRAFT",
  "UPCOMING",
  "ACTIVE",
  "CLOSED",
];

export const campaignModeLabel: Record<CampaignMode, string> = {
  ONLINE: "Trực tuyến",
  OFFLINE: "Trực tiếp",
};

export const campaignModeColor: Record<CampaignMode, "sky" | "gray"> = {
  ONLINE: "sky",
  OFFLINE: "gray",
};

export const campaignModeOptions: CampaignMode[] = ["ONLINE", "OFFLINE"];
