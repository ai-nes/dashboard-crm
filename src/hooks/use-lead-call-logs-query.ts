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

export function useLeadCallLogsQuery(
  leadId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery<LeadCallLogsResponse | null, Error>({
    queryKey: leadCallLogsKeys.detail(leadId),
    queryFn: () => getLeadCallLogs(leadId),
    enabled: Boolean(leadId.trim()) && options.enabled !== false,
    retry: false,
    staleTime: 30_000,
    refetchInterval: (query) =>
      query.state.data?.calls.some((call) => call.summaryStatus === "PENDING")
        ? 3_000
        : false,
  });
}
