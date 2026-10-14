"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  completeLeadSupport,
  listLeadSupportQueue,
  type CompleteLeadSupportRequest,
  type CompleteLeadSupportResponse,
  type LeadSupportQueueParams,
} from "@/services/api/lead-sale";
import { leadAssignmentBatchKeys } from "./use-lead-assignment-batch-queries";
import { leadSaleLeadsKeys } from "./use-lead-sale-leads-queries";

export const leadSupportQueueKeys = {
  all: ["lead-sale", "lead-support-queue"] as const,
  list: (params: LeadSupportQueueParams = {}) =>
    ["lead-sale", "lead-support-queue", "list", params] as const,
};

export function useLeadSupportQueueQuery(
  params: LeadSupportQueueParams,
  enabled = true,
) {
  return useQuery({
    queryKey: leadSupportQueueKeys.list(params),
    queryFn: ({ signal }) => listLeadSupportQueue(params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCompleteLeadSupportMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    CompleteLeadSupportResponse,
    Error,
    CompleteLeadSupportRequest
  >({
    mutationFn: completeLeadSupport,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leadSupportQueueKeys.all }),
        queryClient.invalidateQueries({
          queryKey: leadAssignmentBatchKeys.all,
        }),
        queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
      ]);
    },
  });
}
