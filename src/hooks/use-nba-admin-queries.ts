"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  archiveRecommendationRule,
  createAdminActionType,
  createRecommendationRule,
  deleteAdminActionType,
  createTimingPolicy,
  deleteRecommendationRule,
  deleteTimingPolicy,
  getAdminActionType,
  getRecommendationRule,
  getTimingPolicy,
  listAdminActionTypes,
  listConditionFields,
  listRecommendationRules,
  listTimingPolicies,
  publishRecommendationRule,
  updateAdminActionType,
  updateRecommendationRule,
  updateTimingPolicy,
  type ListActionTypesParams,
  type ListActionTypesResponse,
  type ListRulesParams,
  type ListRulesResponse,
  type ListTimingPoliciesParams,
  type ListTimingPoliciesResponse,
  type NbaAdminActionType,
  type NbaRecommendationRule,
  type NbaTimingPolicy,
  type RecommendationRulePayload,
  type CreateActionTypePayload,
  type TimingPolicyPayload,
  type UpdateActionTypePayload,
} from "@/services/api/nba-admin";

export const nbaAdminKeys = {
  all: ["nba-admin"] as const,
  actionTypes: (params: ListActionTypesParams) => ["nba-admin", "action-types", params] as const,
  actionType: (name: string) => ["nba-admin", "action-type", name] as const,
  timingPolicies: (params: ListTimingPoliciesParams) => ["nba-admin", "timing-policies", params] as const,
  timingPolicy: (name: string) => ["nba-admin", "timing-policy", name] as const,
  rules: (params: ListRulesParams) => ["nba-admin", "rules", params] as const,
  rule: (name: string) => ["nba-admin", "rule", name] as const,
  conditionFields: ["nba-admin", "condition-fields"] as const,
};

export function useNbaAdminActionTypesQuery(
  params: ListActionTypesParams = {},
  options?: Omit<UseQueryOptions<ListActionTypesResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListActionTypesResponse, Error> {
  return useQuery({
    queryKey: nbaAdminKeys.actionTypes(params),
    queryFn: () => listAdminActionTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useNbaActionTypeQuery(
  name: string,
  options?: Omit<UseQueryOptions<NbaAdminActionType, Error>, "queryKey" | "queryFn">,
): UseQueryResult<NbaAdminActionType, Error> {
  return useQuery({
    queryKey: nbaAdminKeys.actionType(name),
    queryFn: () => getAdminActionType(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useNbaTimingPoliciesQuery(
  params: ListTimingPoliciesParams = {},
  options?: Omit<UseQueryOptions<ListTimingPoliciesResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListTimingPoliciesResponse, Error> {
  return useQuery({
    queryKey: nbaAdminKeys.timingPolicies(params),
    queryFn: () => listTimingPolicies(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useNbaTimingPolicyQuery(
  name: string,
  options?: Omit<UseQueryOptions<NbaTimingPolicy, Error>, "queryKey" | "queryFn">,
): UseQueryResult<NbaTimingPolicy, Error> {
  return useQuery({
    queryKey: nbaAdminKeys.timingPolicy(name),
    queryFn: () => getTimingPolicy(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useNbaRulesQuery(
  params: ListRulesParams = {},
  options?: Omit<UseQueryOptions<ListRulesResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListRulesResponse, Error> {
  return useQuery({
    queryKey: nbaAdminKeys.rules(params),
    queryFn: () => listRecommendationRules(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useNbaRuleQuery(
  name: string,
  options?: Omit<UseQueryOptions<NbaRecommendationRule, Error>, "queryKey" | "queryFn">,
): UseQueryResult<NbaRecommendationRule, Error> {
  return useQuery({
    queryKey: nbaAdminKeys.rule(name),
    queryFn: () => getRecommendationRule(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useNbaConditionFieldsQuery(
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof listConditionFields>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: nbaAdminKeys.conditionFields,
    queryFn: () => listConditionFields(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useUpdateNbaActionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateActionTypePayload) => updateAdminActionType(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useCreateNbaActionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateActionTypePayload) => createAdminActionType(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useDeleteNbaActionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteAdminActionType(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useCreateNbaTimingPolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TimingPolicyPayload) => createTimingPolicy(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useUpdateNbaTimingPolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: TimingPolicyPayload }) => updateTimingPolicy(name, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useDeleteNbaTimingPolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteTimingPolicy(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useCreateNbaRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecommendationRulePayload) => createRecommendationRule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useUpdateNbaRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: RecommendationRulePayload }) => updateRecommendationRule(name, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function usePublishNbaRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, expectedVersion }: { name: string; expectedVersion: number }) => publishRecommendationRule(name, expectedVersion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useArchiveNbaRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, reason }: { name: string; reason: string }) => archiveRecommendationRule(name, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}

export function useDeleteNbaRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteRecommendationRule(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaAdminKeys.all }),
  });
}
