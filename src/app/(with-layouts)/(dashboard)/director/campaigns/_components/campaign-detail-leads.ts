import {
  normalizeLeadStageStatus,
  type LeadResultStatus,
  type LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import type { LeadListItem } from "@/services/api/lead-sale";

export interface CampaignLeadRow {
  id: string;
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

export function toCampaignLeadRow(lead: LeadListItem): CampaignLeadRow {
  const status = normalizeLeadStageStatus(
    lead.statusCode ?? lead.status ?? lead.processingStatus,
  );
  const processingStatus = status;
  return {
    id: lead.id,
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
