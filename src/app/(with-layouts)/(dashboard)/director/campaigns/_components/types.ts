export type CampaignStatus = "DRAFT" | "UPCOMING" | "ACTIVE" | "CLOSED";

export type CampaignMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface CampaignListItem {
  id: string;
  code: string;
  name: string;
  admissionYear: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  mode: CampaignMode;
  channelUrl: string;
}

export type CampaignStatusFilter = CampaignStatus | "all";
