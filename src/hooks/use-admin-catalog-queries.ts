"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveGovernedChange,
  createAcademicYearConfig,
  createAdmissionOffering,
  createAdmissionYear,
  createCampaignChannelType,
  createGovernedValue,
  createScoreTemplate,
  deleteAcademicYearConfig,
  deleteAdmissionOffering,
  deleteAdmissionYear,
  deleteCampaignChannelType,
  deleteScoreTemplate,
  getScoreTemplate,
  listAcademicYearConfigs,
  listAdmissionOfferings,
  listAdmissionYears,
  listCampaignChannelTypes,
  listGovernedChanges,
  listGovernedValues,
  listScoreTemplates,
  proposeGovernedChange,
  transitionAdmissionOffering,
  updateAcademicYearConfig,
  updateAdmissionOffering,
  updateAdmissionYear,
  updateCampaignChannelType,
  updateScoreTemplate,
  type AcademicYearConfig,
  type AdmissionOffering,
  type AdmissionYear,
  type CampaignChannelType,
  type GovernedDoctype,
  type ScoreTemplate,
} from "@/services/api/admin-catalog";

export const adminCatalogKeys = {
  all: ["admin-catalog"] as const,
  years: (params: Record<string, unknown>) =>
    ["admin-catalog", "years", params] as const,
  configs: (params: Record<string, unknown>) =>
    ["admin-catalog", "configs", params] as const,
  offerings: (params: Record<string, unknown>) =>
    ["admin-catalog", "offerings", params] as const,
  scores: (params: Record<string, unknown>) =>
    ["admin-catalog", "scores", params] as const,
  channels: (params: Record<string, unknown>) =>
    ["admin-catalog", "channels", params] as const,
  governed: (doctype: GovernedDoctype, params: Record<string, unknown>) =>
    ["admin-catalog", "governed", doctype, params] as const,
  changes: (doctype: GovernedDoctype) =>
    ["admin-catalog", "changes", doctype] as const,
};

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: adminCatalogKeys.all });
}

export function useAdmissionYearsQuery(
  options: { search?: string; start?: number; pageLength?: number } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: adminCatalogKeys.years({
      search,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listAdmissionYears({
        search,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useAcademicYearConfigsQuery(
  options: { search?: string; start?: number; pageLength?: number } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: adminCatalogKeys.configs({
      search,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listAcademicYearConfigs({
        search,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useAdmissionOfferingsQuery(
  options: {
    search?: string;
    status?: string;
    start?: number;
    pageLength?: number;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: adminCatalogKeys.offerings({
      search,
      status: options.status,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listAdmissionOfferings({
        search,
        status: options.status,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useScoreTemplatesQuery(
  options: { search?: string; start?: number; pageLength?: number } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: adminCatalogKeys.scores({
      search,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listScoreTemplates({
        search,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useCampaignChannelTypesAdminQuery(
  options: { search?: string; start?: number; pageLength?: number } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: adminCatalogKeys.channels({
      search,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listCampaignChannelTypes({
        search,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useGovernedValuesQuery(
  doctype: GovernedDoctype,
  options: { search?: string; start?: number; pageLength?: number } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: adminCatalogKeys.governed(doctype, {
      search,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listGovernedValues(doctype, {
        search,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useGovernedChangesQuery(doctype: GovernedDoctype) {
  return useQuery({
    queryKey: adminCatalogKeys.changes(doctype),
    queryFn: () => listGovernedChanges(doctype),
    staleTime: 10_000,
  });
}

function useAdminCatalogMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => invalidate(queryClient) });
}

export function useCreateAdmissionYearMutation() {
  return useAdminCatalogMutation((data: Partial<AdmissionYear>) =>
    createAdmissionYear(data),
  );
}
export function useUpdateAdmissionYearMutation() {
  return useAdminCatalogMutation(
    (input: {
      name: string;
      data: Partial<AdmissionYear>;
      expectedModified?: string;
    }) => updateAdmissionYear(input.name, input.data, input.expectedModified),
  );
}
export function useDeleteAdmissionYearMutation() {
  return useAdminCatalogMutation(
    (input: { name: string; expectedModified?: string }) =>
      deleteAdmissionYear(input.name, input.expectedModified),
  );
}
export function useCreateAcademicYearConfigMutation() {
  return useAdminCatalogMutation((data: Partial<AcademicYearConfig>) =>
    createAcademicYearConfig(data),
  );
}
export function useUpdateAcademicYearConfigMutation() {
  return useAdminCatalogMutation(
    (input: {
      name: string;
      data: Partial<AcademicYearConfig>;
      expectedModified?: string;
    }) =>
      updateAcademicYearConfig(input.name, input.data, input.expectedModified),
  );
}
export function useDeleteAcademicYearConfigMutation() {
  return useAdminCatalogMutation(
    (input: { name: string; expectedModified?: string }) =>
      deleteAcademicYearConfig(input.name, input.expectedModified),
  );
}
export function useCreateAdmissionOfferingMutation() {
  return useAdminCatalogMutation((data: Partial<AdmissionOffering>) =>
    createAdmissionOffering(data),
  );
}
export function useUpdateAdmissionOfferingMutation() {
  return useAdminCatalogMutation(
    (input: {
      name: string;
      data: Partial<AdmissionOffering>;
      expectedModified?: string;
    }) =>
      updateAdmissionOffering(input.name, input.data, input.expectedModified),
  );
}
export function useTransitionAdmissionOfferingMutation() {
  return useAdminCatalogMutation(
    (input: {
      name: string;
      status: AdmissionOffering["status"];
      expectedModified?: string;
      idempotencyKey?: string;
    }) =>
      transitionAdmissionOffering(
        input.name,
        input.status,
        input.expectedModified,
        input.idempotencyKey,
      ),
  );
}
export function useDeleteAdmissionOfferingMutation() {
  return useAdminCatalogMutation(
    (input: { name: string; expectedModified?: string }) =>
      deleteAdmissionOffering(input.name, input.expectedModified),
  );
}
export function useScoreTemplateMutation() {
  return useAdminCatalogMutation(
    (input: {
      name?: string;
      data: Partial<ScoreTemplate>;
      expectedModified?: string;
    }) =>
      input.name
        ? updateScoreTemplate(input.name, input.data, input.expectedModified)
        : createScoreTemplate(input.data),
  );
}
export function useDeleteScoreTemplateMutation() {
  return useAdminCatalogMutation(
    (input: { name: string; expectedModified?: string }) =>
      deleteScoreTemplate(input.name, input.expectedModified),
  );
}
export function useCampaignChannelTypeMutation() {
  return useAdminCatalogMutation(
    (input: { name?: string; data: Partial<CampaignChannelType> }) =>
      input.name
        ? updateCampaignChannelType(input.name, input.data)
        : createCampaignChannelType(input.data),
  );
}
export function useDeleteCampaignChannelTypeMutation() {
  return useAdminCatalogMutation((name: string) =>
    deleteCampaignChannelType(name),
  );
}
export function useCreateGovernedValueMutation() {
  return useAdminCatalogMutation(
    (input: { doctype: GovernedDoctype; data: Record<string, unknown> }) =>
      createGovernedValue(input.doctype, input.data),
  );
}
export function useProposeGovernedChangeMutation() {
  return useAdminCatalogMutation(proposeGovernedChange);
}
export function useApproveGovernedChangeMutation() {
  return useAdminCatalogMutation((name: string) => approveGovernedChange(name));
}
export function useScoreTemplateDetailQuery(name: string | null) {
  return useQuery({
    queryKey: ["admin-catalog", "score-detail", name],
    queryFn: () => getScoreTemplate(name!),
    enabled: Boolean(name),
  });
}
