import {
  leadStageStatusOptions,
  normalizeLeadStageStatus,
  type LeadResultStatus,
  type LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import type { LeadListItem } from "@/services/api/lead-sale";

export interface CampaignLeadRow {
  id: string;
  leadCode?: string | null;
  name: string;
  initials: string;
  phone: string;
  school: string;
  status: LeadStageStatus | null;
  processingStatus: LeadStageStatus | null;
  result: LeadResultStatus | "";
  source: string;
  owner: string;
  contactNoAnswer: number;
  contactSuccess: number;
  createdAt: string;
}

export type CampaignLeadStatusFilter = LeadStageStatus | "all";

export function filterCampaignLeads(
  leads: readonly CampaignLeadRow[],
  query: string,
  status: CampaignLeadStatusFilter,
): CampaignLeadRow[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");

  return leads.filter((lead) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        lead.id,
        lead.leadCode ?? "",
        lead.name,
        lead.phone,
        lead.school,
        lead.source,
        lead.owner,
      ].some((value) =>
        value.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
      );
    const matchesStatus = status === "all" || lead.status === status;
    return matchesQuery && matchesStatus;
  });
}

export function countCampaignLeadsByStatus(
  leads: readonly CampaignLeadRow[],
): Record<CampaignLeadStatusFilter, number> {
  const counts: Record<CampaignLeadStatusFilter, number> = {
    all: leads.length,
    NEW: 0,
    PROCESSING: 0,
    PROCESSED: 0,
    ASSIGNED: 0,
    CLOSED: 0,
  };

  for (const lead of leads) {
    if (lead.status && leadStageStatusOptions.includes(lead.status)) {
      counts[lead.status] += 1;
    }
  }

  return counts;
}

export function toCampaignLeadRow(lead: LeadListItem): CampaignLeadRow {
  const status = normalizeLeadStageStatus(
    lead.statusCode ?? lead.status ?? lead.processingStatus,
  );
  const processingStatus = status;
  return {
    id: lead.id,
    leadCode: lead.leadCode,
    name: lead.name || lead.id,
    initials: lead.initials || lead.name.charAt(0).toUpperCase(),
    phone: lead.phone,
    school: lead.school,
    status,
    processingStatus,
    result: lead.result,
    source: lead.source,
    owner: lead.owner,
    contactNoAnswer: lead.contactNoAnswer,
    contactSuccess: lead.contactSuccess,
    createdAt: lead.createdAt ?? "",
  };
}
