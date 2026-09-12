import type { ChannelTypeValue } from "./channel-types";

import type { CampaignStatus as SharedCampaignStatus } from "@/services/api/campaigns";

export type CampaignStatus = SharedCampaignStatus;

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
