"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMajor,
  createMajorGroup,
  deleteMajor,
  deleteMajorGroup,
  listMajorGroups,
  listMajors,
  updateMajor,
  updateMajorGroup,
  type MajorGroupMutationInput,
  type MajorMutationInput,
  type UpdateMajorGroupInput,
  type UpdateMajorInput,
  type DeleteMajorGroupInput,
  type DeleteMajorInput,
} from "@/services/api/major-catalog";

export const majorCatalogKeys = {
  all: ["major-catalog"] as const,
  groups: (params: Record<string, unknown>) =>
    ["major-catalog", "groups", params] as const,
  majors: (params: Record<string, unknown>) =>
    ["major-catalog", "majors", params] as const,
};

function invalidateMajorCatalog(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: majorCatalogKeys.all });
  void queryClient.invalidateQueries({
    queryKey: ["student-school-field-options"],
  });
}

export function useMajorGroupsQuery(
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
    queryKey: majorCatalogKeys.groups({
      search,
      includeDisabled,
      enabled: options.enabled,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listMajorGroups({
        search,
        includeDisabled,
        enabled: options.enabled,
        start: options.start,
        pageLength: options.pageLength,
      }),
    staleTime: 30_000,
  });
}

export function useMajorsQuery(
  options: {
    search?: string;
    group?: string;
    includeInactive?: boolean;
    isActive?: boolean;
    start?: number;
    pageLength?: number;
    enabled?: boolean;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  const includeInactive = options.includeInactive ?? true;
  return useQuery({
    queryKey: majorCatalogKeys.majors({
      search,
      group: options.group,
      includeInactive,
      isActive: options.isActive,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listMajors({
        search,
        group: options.group,
        includeInactive,
        isActive: options.isActive,
        start: options.start,
        pageLength: options.pageLength,
      }),
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useCreateMajorGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MajorGroupMutationInput) => createMajorGroup(data),
    onSuccess: () => invalidateMajorCatalog(queryClient),
  });
}

export function useUpdateMajorGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMajorGroupInput) => updateMajorGroup(input),
    onSuccess: () => invalidateMajorCatalog(queryClient),
  });
}

export function useDeleteMajorGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteMajorGroupInput) => deleteMajorGroup(input),
    onSuccess: () => invalidateMajorCatalog(queryClient),
  });
}

export function useCreateMajorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MajorMutationInput) => createMajor(data),
    onSuccess: () => invalidateMajorCatalog(queryClient),
  });
}

export function useUpdateMajorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMajorInput) => updateMajor(input),
    onSuccess: () => invalidateMajorCatalog(queryClient),
  });
}

export function useDeleteMajorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteMajorInput) => deleteMajor(input),
    onSuccess: () => invalidateMajorCatalog(queryClient),
  });
}
