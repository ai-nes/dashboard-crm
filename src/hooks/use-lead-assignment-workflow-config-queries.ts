"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getLeadAssignmentWorkflowConfig,
  updateLeadAssignmentWorkflowStep,
  type LeadAssignmentWorkflowConfigResponse,
  type LeadAssignmentWorkflowStepUpdate,
} from "@/services/api/lead-sale";
import { leadRoutingPolicyKeys } from "./use-lead-routing-policy-queries";
import { leadAssignmentBatchKeys } from "./use-lead-assignment-batch-queries";

export const leadAssignmentWorkflowConfigKeys = {
  all: ["lead-assignment-workflow-config"] as const,
  current: () => ["lead-assignment-workflow-config", "current"] as const,
};

export function useLeadAssignmentWorkflowConfigQuery(
  options?: Omit<
    UseQueryOptions<
      LeadAssignmentWorkflowConfigResponse,
      Error,
      LeadAssignmentWorkflowConfigResponse,
      ReturnType<typeof leadAssignmentWorkflowConfigKeys.current>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<LeadAssignmentWorkflowConfigResponse, Error> {
  return useQuery({
    queryKey: leadAssignmentWorkflowConfigKeys.current(),
    queryFn: () => getLeadAssignmentWorkflowConfig(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUpdateLeadAssignmentWorkflowStepMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    LeadAssignmentWorkflowConfigResponse,
    Error,
    LeadAssignmentWorkflowStepUpdate
  >({
    mutationFn: (request) => updateLeadAssignmentWorkflowStep(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadAssignmentWorkflowConfigKeys.all,
        }),
        queryClient.invalidateQueries({ queryKey: leadRoutingPolicyKeys.all }),
        queryClient.invalidateQueries({ queryKey: leadAssignmentBatchKeys.all }),
      ]);
    },
  });
}
