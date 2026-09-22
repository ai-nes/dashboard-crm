"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getLeadRoutingPolicy,
  updateLeadRoutingPolicy,
  type LeadRoutingPolicyResponse,
  type UpdateLeadRoutingPolicyRequest,
} from "@/services/api/lead-sale";

export const leadRoutingPolicyKeys = {
  all: ["lead-routing-policy"] as const,
  current: () => ["lead-routing-policy", "current"] as const,
};

export function useLeadRoutingPolicyQuery(
  options?: Omit<
    UseQueryOptions<
      LeadRoutingPolicyResponse,
      Error,
      LeadRoutingPolicyResponse,
      ReturnType<typeof leadRoutingPolicyKeys.current>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<LeadRoutingPolicyResponse, Error> {
  return useQuery({
    queryKey: leadRoutingPolicyKeys.current(),
    queryFn: () => getLeadRoutingPolicy(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUpdateLeadRoutingPolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    LeadRoutingPolicyResponse,
    Error,
    UpdateLeadRoutingPolicyRequest
  >({
    mutationFn: (request) => updateLeadRoutingPolicy(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leadRoutingPolicyKeys.all,
      });
    },
  });
}
