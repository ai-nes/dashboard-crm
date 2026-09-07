import type { CampaignMode, CampaignStatus } from "./types";

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  DRAFT: "Nháp",
  UPCOMING: "Sắp diễn ra",
  ACTIVE: "Đang diễn ra",
  CLOSED: "Đã đóng",
};

export const campaignStatusColor: Record<CampaignStatus, "gray" | "sky" | "success" | "warning"> = {
  DRAFT: "gray",
  UPCOMING: "sky",
  ACTIVE: "success",
  CLOSED: "warning",
};

export const campaignStatusOptions: CampaignStatus[] = ["DRAFT", "UPCOMING", "ACTIVE", "CLOSED"];

export const campaignModeLabel: Record<CampaignMode, string> = {
  ONLINE: "Trực tuyến",
  OFFLINE: "Trực tiếp",
  HYBRID: "Kết hợp",
};

export const campaignModeColor: Record<CampaignMode, "sky" | "gray" | "violet"> = {
  ONLINE: "sky",
  OFFLINE: "gray",
  HYBRID: "violet",
};

export const campaignModeOptions: CampaignMode[] = ["ONLINE", "OFFLINE", "HYBRID"];
