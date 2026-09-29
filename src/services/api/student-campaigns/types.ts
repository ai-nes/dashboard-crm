export interface StudentCampaignDetails {
  stableCode: string | null;
  status: string | null;
  campaignType: string | null;
  eventType: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface StudentEventDetails {
  eventDate: string | null;
  startDatetime: string | null;
  endDatetime: string | null;
  location: string | null;
}

export interface StudentCampaignParticipation {
  label: string;
  campaign: string | null;
  event: string | null;
  kind: "campaign" | "event";
  status: string | null;
  occurredAt: string | null;
  campaignDetails: StudentCampaignDetails | null;
  eventDetails: StudentEventDetails | null;
}

export interface StudentCampaignHistory {
  campaigns: StudentCampaignParticipation[];
}
