import { nestRequest } from "../nest/nest-client";

export type LeadSupportReason =
  | "INVALID"
  | "MISSING_PROVINCE"
  | "MISSING_CAMPUS"
  | "CAMPUS_MISMATCH";

export type LeadSupportOutcome =
  | "assigned"
  | "waiting_assignment"
  | "needs_configuration"
  | "still_invalid"
  | "closed_duplicate";

export type LeadSupportItem = {
  id: string;
  leadCode: string;
  studentName: string;
  phone: string;
  province: { id: string; name: string } | null;
  campus: { id: string; name: string } | null;
  campaign: {
    id: string;
    name: string;
    campusId: string;
    campusName: string;
  } | null;
  processingStatus: string;
  resolution: string;
  resolutionReason: string;
  reason: LeadSupportReason;
  revision: number;
  createdAt: string;
};

export type LeadSupportQueueParams = {
  page?: number;
  limit?: number;
  reason?: LeadSupportReason;
  q?: string;
};

export type LeadSupportQueueResponse = {
  items: LeadSupportItem[];
  counts: Record<LeadSupportReason, number>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

export type CompleteLeadSupportRequest = {
  leadId: string;
  expectedRevision: number;
  studentName?: string;
  phone?: string;
  provinceId?: string;
  campusId?: string;
};

export type CompleteLeadSupportResponse = {
  outcome: LeadSupportOutcome;
  issues: string[];
  lead: {
    id: string;
    leadCode: string;
    processingStatus: string;
    resolution: string;
    ownerUserId: string | null;
    revision: number;
  };
};

export function listLeadSupportQueue(
  params: LeadSupportQueueParams = {},
  signal?: AbortSignal,
) {
  return nestRequest<LeadSupportQueueResponse>("/api/v1/leads/support-queue", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      reason: params.reason,
      q: params.q?.trim() || undefined,
    },
    signal,
  });
}

export function completeLeadSupport({
  leadId,
  ...body
}: CompleteLeadSupportRequest) {
  return nestRequest<CompleteLeadSupportResponse>(
    `/api/v1/leads/support-queue/${encodeURIComponent(leadId)}`,
    { method: "PATCH", body },
  );
}
