import { CAMPAIGN_STATUS_LABEL } from "@/services/api/campaigns";
import type {
  CampaignMode,
  CampaignModeValue,
  CampaignStatus,
  CampaignStatusValue,
} from "./types";

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

export function getCampaignStatusLabel(value: CampaignStatusValue): string {
  return value ? campaignStatusLabel[value] : "—";
}

export function getCampaignStatusColor(
  value: CampaignStatusValue,
): "gray" | "sky" | "success" | "warning" {
  return value ? campaignStatusColor[value] : "gray";
}

export const campaignStatusOptions: CampaignStatus[] = [
  "DRAFT",
  "UPCOMING",
  "ACTIVE",
  "CLOSED",
];

export function isCampaignStatus(value: CampaignStatusValue): value is CampaignStatus {
  return campaignStatusOptions.includes(value as CampaignStatus);
}

export const campaignModeLabel: Record<CampaignMode, string> = {
  ONLINE: "Trực tuyến",
  OFFLINE: "Trực tiếp",
};

export const campaignModeColor: Record<CampaignMode, "sky" | "gray"> = {
  ONLINE: "sky",
  OFFLINE: "gray",
};

export function getCampaignModeLabel(value: CampaignModeValue): string {
  return value ? campaignModeLabel[value] : "—";
}

export function getCampaignModeColor(value: CampaignModeValue): "sky" | "gray" {
  return value ? campaignModeColor[value] : "gray";
}

export const campaignModeOptions: CampaignMode[] = ["ONLINE", "OFFLINE"];

export function isCampaignMode(value: CampaignModeValue): value is CampaignMode {
  return campaignModeOptions.includes(value as CampaignMode);
}
