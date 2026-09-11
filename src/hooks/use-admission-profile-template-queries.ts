"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdmissionProfileTemplate,
  deleteAdmissionProfileTemplate,
  listAdmissionDocumentTypes,
  listAdmissionProfileTemplates,
  transitionAdmissionProfileTemplate,
  updateAdmissionProfileTemplate,
  type DeleteAdmissionProfileTemplateInput,
  type AdmissionProfileTemplateMutationInput,
  type TransitionAdmissionProfileTemplateInput,
  type UpdateAdmissionProfileTemplateInput,
} from "@/services/api/admission-profile-catalog";

export const admissionProfileTemplateKeys = {
  all: ["admission-profile-templates"] as const,
  catalog: ["admission-profile-templates", "catalog"] as const,
  documentTypes: (search: string) =>
    ["admission-profile-templates", "document-types", search] as const,
};

export function useAdmissionProfileTemplatesQuery() {
  return useQuery({
    queryKey: admissionProfileTemplateKeys.catalog,
    queryFn: () => listAdmissionProfileTemplates(),
    staleTime: 30_000,
  });
}

export function useAdmissionProfileDocumentTypesQuery(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: admissionProfileTemplateKeys.documentTypes(normalizedSearch),
    queryFn: async () =>
      (await listAdmissionDocumentTypes({ search: normalizedSearch, includeArchived: false }))
        .documentTypes,
    enabled: Boolean(normalizedSearch),
    staleTime: 60_000,
  });
}

function invalidateAdmissionProfileTemplates(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: admissionProfileTemplateKeys.all });
}

export function useCreateAdmissionProfileTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmissionProfileTemplateMutationInput) =>
      createAdmissionProfileTemplate(data),
    onSuccess: () => invalidateAdmissionProfileTemplates(queryClient),
  });
}

export function useUpdateAdmissionProfileTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdmissionProfileTemplateInput) =>
      updateAdmissionProfileTemplate(input),
    onSuccess: () => invalidateAdmissionProfileTemplates(queryClient),
  });
}

export function useTransitionAdmissionProfileTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransitionAdmissionProfileTemplateInput) =>
      transitionAdmissionProfileTemplate(input),
    onSuccess: () => invalidateAdmissionProfileTemplates(queryClient),
  });
}

export function useDeleteAdmissionProfileTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteAdmissionProfileTemplateInput) =>
      deleteAdmissionProfileTemplate(input),
    onSuccess: () => invalidateAdmissionProfileTemplates(queryClient),
  });
}
