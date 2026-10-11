import type { CampaignStatus } from "../campaigns";
import { nestRequest } from "../nest/nest-client";

export interface StudentCampaignParticipation {
  id: string;
  campaignId: string;
  title: string;
  code: string | null;
  status: CampaignStatus;
  channel: string | null;
  startDate: string | null;
  endDate: string | null;
  registeredAt: string;
  timestampEstimated: boolean;
  isNewLead: boolean;
  isOriginalCampaign: boolean;
}

export interface StudentCampaignsResponse {
  data: StudentCampaignParticipation[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export function getStudentCampaigns(
  studentId: string,
  page: number,
  signal?: AbortSignal,
): Promise<StudentCampaignsResponse> {
  return nestRequest(
    `/api/v1/students/${encodeURIComponent(studentId)}/campaigns`,
    {
      query: { page, pageSize: 20 },
      signal,
    },
  );
}
