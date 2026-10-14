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

export interface StudentCampaignOptionsResponse {
  data: {
    id: string;
    title: string;
    stableCode: string | null;
    status: CampaignStatus;
  }[];
  meta: { page: number; total: number; hasNextPage: boolean };
}

export function getStudentCampaignOptions(
  studentId: string,
  search: string,
  page: number,
  signal?: AbortSignal,
): Promise<StudentCampaignOptionsResponse> {
  return nestRequest(
    `/api/v1/students/${encodeURIComponent(studentId)}/campaign-options`,
    { query: { search, page, pageSize: 20 }, signal },
  );
}

export function addStudentCampaign(
  studentId: string,
  campaignId: string,
  registeredAt?: string,
): Promise<{ data: { id: string; campaignId: string } }> {
  return nestRequest(
    `/api/v1/students/${encodeURIComponent(studentId)}/campaigns`,
    {
      method: "POST",
      body: { campaignId, ...(registeredAt ? { registeredAt } : {}) },
    },
  );
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
