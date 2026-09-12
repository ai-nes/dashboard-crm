export type CampaignStatus = "DRAFT" | "UPCOMING" | "ACTIVE" | "CLOSED";

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "Nháp",
  UPCOMING: "Sắp diễn ra",
  ACTIVE: "Đang diễn ra",
  CLOSED: "Đã đóng",
};
