"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  archiveCrmRuleVersion,
  cloneCrmRuleVersion,
  createCrmRule,
  createCrmRuleGroup,
  createCrmRuleVersion,
  deleteCrmRuleGroup,
  deleteCrmRule,
  getCrmRule,
  getCrmRuleVersion,
  listCrmFactCatalog,
  listCrmRuleGroups,
  listCrmRules,
  listCrmRuleVersions,
  setCrmRuleEnabled,
  updateCrmRuleGroup,
  updateCrmRule,
  updateCrmRuleVersion,
  CrmRulesApiError,
  type ArchiveCrmRuleVersionPayload,
  type CloneCrmRuleVersionPayload,
  type CreateCrmRulePayload,
  type CrmRule,
  type CrmRuleFactCatalog,
  type CrmRuleGroupSummary,
  type CrmRuleGroupPayload,
  type UpdateCrmRuleGroupPayload,
  type DeleteCrmRuleGroupPayload,
  type CrmRuleVersionDetail,
  type CrmRuleVersionPayload,
  type DeleteCrmRulePayload,
  type ListCrmRulesParams,
  type ListCrmRulesResponse,
  type ListCrmRuleVersionsParams,
  type ListCrmRuleVersionsResponse,
  type SetCrmRuleEnabledPayload,
  type UpdateCrmRulePayload,
  type UpdateCrmRuleVersionPayload,
} from "@/services/api/rules-config";

export const crmRulesKeys = {
  all: ["crm-rules"] as const,
  versions: (params: ListCrmRuleVersionsParams) => ["crm-rules", "versions", params] as const,
  version: (name: string) => ["crm-rules", "version", name] as const,
  groups: (versionName: string) => ["crm-rules", "groups", versionName] as const,
  list: (params: ListCrmRulesParams) => ["crm-rules", "list", params] as const,
  detail: (name: string) => ["crm-rules", "detail", name] as const,
  facts: ["crm-rules", "facts"] as const,
};

export function useCrmRuleVersionsQuery(
  params: ListCrmRuleVersionsParams = {},
  options?: Omit<UseQueryOptions<ListCrmRuleVersionsResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListCrmRuleVersionsResponse, Error> {
  return useQuery({
    queryKey: crmRulesKeys.versions(params),
    queryFn: () => listCrmRuleVersions(params),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCrmRuleVersionQuery(
  name: string,
  options?: Omit<UseQueryOptions<CrmRuleVersionDetail, Error>, "queryKey" | "queryFn">,
): UseQueryResult<CrmRuleVersionDetail, Error> {
  return useQuery({
    queryKey: crmRulesKeys.version(name),
    queryFn: () => getCrmRuleVersion(name),
    enabled: Boolean(name),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCrmRuleGroupsQuery(
  versionName: string,
  options?: Omit<UseQueryOptions<CrmRuleGroupSummary[], Error>, "queryKey" | "queryFn">,
): UseQueryResult<CrmRuleGroupSummary[], Error> {
  return useQuery({
    queryKey: crmRulesKeys.groups(versionName),
    queryFn: () => listCrmRuleGroups(versionName),
    enabled: Boolean(versionName),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCrmRulesQuery(
  params: ListCrmRulesParams = {},
  options?: Omit<UseQueryOptions<ListCrmRulesResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListCrmRulesResponse, Error> {
  return useQuery({
    queryKey: crmRulesKeys.list(params),
    queryFn: () => listCrmRules(params),
    enabled: Boolean(params.versionName),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCrmRuleQuery(
  name: string,
  options?: Omit<UseQueryOptions<CrmRule, Error>, "queryKey" | "queryFn">,
): UseQueryResult<CrmRule, Error> {
  return useQuery({
    queryKey: crmRulesKeys.detail(name),
    queryFn: () => getCrmRule(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useCrmFactsQuery(
  options?: Omit<UseQueryOptions<CrmRuleFactCatalog, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: crmRulesKeys.facts,
    queryFn: () => listCrmFactCatalog(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

function invalidateRules(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: crmRulesKeys.all });
}

function refreshAfterStale(queryClient: ReturnType<typeof useQueryClient>, error: unknown) {
  if (error instanceof CrmRulesApiError && error.code === "STALE_RULE_VERSION") {
    return invalidateRules(queryClient);
  }
  return undefined;
}

export function useCreateCrmRuleVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrmRuleVersionPayload) => createCrmRuleVersion(payload),
    onSuccess: () => invalidateRules(queryClient),
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useUpdateCrmRuleVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCrmRuleVersionPayload) => updateCrmRuleVersion(payload),
    onSuccess: (version) => {
      queryClient.setQueryData(crmRulesKeys.version(version.name), { ...version, groups: [] });
      return invalidateRules(queryClient);
    },
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useCloneCrmRuleVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CloneCrmRuleVersionPayload) => cloneCrmRuleVersion(payload),
    onSuccess: () => invalidateRules(queryClient),
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function usePublishCrmRuleVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, expectedRevision, expectedSettingsRevision }: { name: string; expectedRevision: number; expectedSettingsRevision?: number }) => updateCrmRuleVersion({
      name,
      expectedRevision,
      status: "active",
      expectedSettingsRevision,
    }),
    onSuccess: () => invalidateRules(queryClient),
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useCreateCrmRuleGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrmRuleGroupPayload) => createCrmRuleGroup(payload),
    onSuccess: (_group, payload) => {
      void queryClient.invalidateQueries({ queryKey: crmRulesKeys.groups(payload.versionName) });
      return invalidateRules(queryClient);
    },
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useUpdateCrmRuleGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCrmRuleGroupPayload) => updateCrmRuleGroup(payload),
    onSuccess: (_group, payload) => {
      void queryClient.invalidateQueries({ queryKey: crmRulesKeys.groups(payload.versionName) });
      return invalidateRules(queryClient);
    },
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useDeleteCrmRuleGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteCrmRuleGroupPayload) => deleteCrmRuleGroup(payload),
    onSuccess: (_result, payload) => {
      void queryClient.invalidateQueries({ queryKey: crmRulesKeys.groups(payload.versionName) });
      return invalidateRules(queryClient);
    },
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useArchiveCrmRuleVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ArchiveCrmRuleVersionPayload) => archiveCrmRuleVersion(payload),
    onSuccess: () => invalidateRules(queryClient),
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useCreateCrmRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCrmRulePayload) => createCrmRule(payload),
    onSuccess: () => invalidateRules(queryClient),
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useUpdateCrmRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCrmRulePayload) => updateCrmRule(payload),
    onSuccess: (rule) => {
      queryClient.setQueryData(crmRulesKeys.detail(rule.name), rule);
      return invalidateRules(queryClient);
    },
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useDeleteCrmRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteCrmRulePayload) => deleteCrmRule(payload),
    onSuccess: () => invalidateRules(queryClient),
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}

export function useSetCrmRuleEnabledMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetCrmRuleEnabledPayload) => setCrmRuleEnabled(payload),
    onSuccess: (rule) => {
      queryClient.setQueryData(crmRulesKeys.detail(rule.name), rule);
      return invalidateRules(queryClient);
    },
    onError: (error) => refreshAfterStale(queryClient, error),
  });
}
