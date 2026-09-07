import type { ChannelTypeValue } from "./channel-types";

export type CampaignStatus = "DRAFT" | "UPCOMING" | "ACTIVE" | "CLOSED";

export type CampaignMode = "ONLINE" | "OFFLINE";

export interface CampaignListItem {
  id: string;
  code: string;
  name: string;
  admissionYear: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  mode: CampaignMode;
  channelType: ChannelTypeValue | "";
  channelUrl: string;
}

export type CampaignFormValues = Omit<CampaignListItem, "id" | "code">;

export interface CampaignFormState {
  name: string;
  admissionYear: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  mode: CampaignMode;
  channelType: ChannelTypeValue | "";
  channelUrl: string;
}

export type CampaignStatusFilter = CampaignStatus | "all";
