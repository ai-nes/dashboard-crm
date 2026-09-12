"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdmissionDocumentType,
  createAdmissionMethod,
  deleteAdmissionDocumentType,
  deleteAdmissionMethod,
  listAdmissionDocumentTypes,
  listAdmissionMethods,
  updateAdmissionDocumentType,
  updateAdmissionMethod,
  type AdmissionDocumentTypeMutationInput,
  type AdmissionMethodMutationInput,
  type DeleteAdmissionDocumentTypeInput,
  type DeleteAdmissionMethodInput,
  type UpdateAdmissionDocumentTypeInput,
  type UpdateAdmissionMethodInput,
} from "@/services/api/admission-profile-catalog";

export const admissionCatalogKeys = {
  all: ["admission-catalog"] as const,
  documentTypes: (params: Record<string, unknown>) =>
    ["admission-catalog", "document-types", params] as const,
  methods: (params: Record<string, unknown>) =>
    ["admission-catalog", "methods", params] as const,
};

function invalidateAdmissionCatalog(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: admissionCatalogKeys.all });
  void queryClient.invalidateQueries({
    queryKey: ["admission-profile-templates"],
  });
  void queryClient.invalidateQueries({
    queryKey: ["admission-profile-catalog"],
  });
}

export function useAdmissionDocumentTypesQuery(
  options: {
    search?: string;
    includeArchived?: boolean;
    status?: string;
    start?: number;
    pageLength?: number;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  const includeArchived = options.includeArchived ?? true;

  return useQuery({
    queryKey: admissionCatalogKeys.documentTypes({
      search,
      includeArchived,
      status: options.status,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listAdmissionDocumentTypes({
        search,
        includeArchived,
        status: options.status as "Active" | "Archived" | "all" | undefined,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useAdmissionMethodsQuery(
  options: {
    search?: string;
    includeDisabled?: boolean;
    enabled?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  const includeDisabled = options.includeDisabled ?? true;

  return useQuery({
    queryKey: admissionCatalogKeys.methods({
      search,
      includeDisabled,
      enabled: options.enabled,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listAdmissionMethods({
        search,
        includeDisabled,
        enabled: options.enabled,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useCreateAdmissionDocumentTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmissionDocumentTypeMutationInput) =>
      createAdmissionDocumentType(data),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  });
}

export function useUpdateAdmissionDocumentTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdmissionDocumentTypeInput) =>
      updateAdmissionDocumentType(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  });
}

export function useDeleteAdmissionDocumentTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteAdmissionDocumentTypeInput) =>
      deleteAdmissionDocumentType(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  });
}

export function useCreateAdmissionMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmissionMethodMutationInput) =>
      createAdmissionMethod(data),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  });
}

export function useUpdateAdmissionMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdmissionMethodInput) =>
      updateAdmissionMethod(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  });
}

export function useDeleteAdmissionMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteAdmissionMethodInput) =>
      deleteAdmissionMethod(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  });
}
