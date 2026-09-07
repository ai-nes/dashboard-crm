"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getLeadCallLogs,
  type LeadCallLogsResponse,
} from "@/services/api/lead-sale/call-logs";

export const leadCallLogsKeys = {
  all: ["lead-call-logs"] as const,
  detail: (leadId: string) => ["lead-call-logs", leadId] as const,
};

export function useLeadCallLogsQuery(leadId: string) {
  return useQuery<LeadCallLogsResponse | null, Error>({
    queryKey: leadCallLogsKeys.detail(leadId),
    queryFn: () => getLeadCallLogs(leadId),
    enabled: Boolean(leadId.trim()),
    retry: false,
    staleTime: 30_000,
  });
}
