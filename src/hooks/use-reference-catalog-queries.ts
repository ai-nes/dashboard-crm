"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProvince,
  createSchool,
  createSchoolArea,
  createWard,
  deleteProvince,
  deleteSchool,
  deleteSchoolArea,
  deleteWard,
  listGeographyOptions,
  listProvinces,
  listSchoolAreas,
  listSchools,
  listWards,
  updateProvince,
  updateSchool,
  updateSchoolArea,
  updateWard,
  type DeleteCatalogInput,
  type ProvinceMutationInput,
  type SchoolAreaMutationInput,
  type SchoolMutationInput,
  type UpdateProvinceInput,
  type UpdateSchoolAreaInput,
  type UpdateSchoolInput,
  type UpdateWardInput,
  type WardMutationInput,
} from "@/services/api/reference-catalog";

export const referenceCatalogKeys = {
  all: ["reference-catalog"] as const,
  provinces: (params: Record<string, unknown>) =>
    ["reference-catalog", "provinces", params] as const,
  wards: (params: Record<string, unknown>) =>
    ["reference-catalog", "wards", params] as const,
  schools: (params: Record<string, unknown>) =>
    ["reference-catalog", "schools", params] as const,
  schoolAreas: (params: Record<string, unknown>) =>
    ["reference-catalog", "school-areas", params] as const,
  options: (province?: string) =>
    ["reference-catalog", "options", province] as const,
};

function invalidateReferenceCatalog(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: referenceCatalogKeys.all });
  void queryClient.invalidateQueries({
    queryKey: ["student-school-field-options"],
  });
  void queryClient.invalidateQueries({ queryKey: ["school-directory"] });
}

export function useProvincesQuery(
  options: {
    search?: string;
    region?: string;
    cityType?: string;
    start?: number;
    pageLength?: number;
    enabled?: boolean;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: referenceCatalogKeys.provinces({
      search,
      region: options.region,
      cityType: options.cityType,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listProvinces({
        search,
        region: options.region,
        cityType: options.cityType,
        start: options.start,
        pageLength: options.pageLength,
      }),
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useWardsQuery(
  options: {
    search?: string;
    province?: string;
    zone?: string;
    wardType?: string;
    start?: number;
    pageLength?: number;
    enabled?: boolean;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: referenceCatalogKeys.wards({
      search,
      province: options.province,
      zone: options.zone,
      wardType: options.wardType,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listWards({
        search,
        province: options.province,
        zone: options.zone,
        wardType: options.wardType,
        start: options.start,
        pageLength: options.pageLength,
      }),
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useSchoolsQuery(
  options: {
    search?: string;
    province?: string;
    ward?: string;
    schoolArea?: string;
    isActive?: boolean;
    start?: number;
    pageLength?: number;
    enabled?: boolean;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: referenceCatalogKeys.schools({
      search,
      province: options.province,
      ward: options.ward,
      schoolArea: options.schoolArea,
      isActive: options.isActive,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listSchools({
        search,
        province: options.province,
        ward: options.ward,
        schoolArea: options.schoolArea,
        isActive: options.isActive,
        start: options.start,
        pageLength: options.pageLength,
      }),
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useSchoolAreasQuery(
  options: {
    search?: string;
    includeDisabled?: boolean;
    enabled?: boolean;
    queryEnabled?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
) {
  const search = options.search?.trim() ?? "";
  return useQuery({
    queryKey: referenceCatalogKeys.schoolAreas({
      search,
      includeDisabled: options.includeDisabled ?? true,
      enabled: options.enabled,
      start: options.start,
      pageLength: options.pageLength,
    }),
    queryFn: () =>
      listSchoolAreas({
        search,
        includeDisabled: options.includeDisabled,
        enabled: options.enabled,
        start: options.start,
        pageLength: options.pageLength,
      }),
    enabled: options.queryEnabled ?? true,
    staleTime: 30_000,
  });
}

export function useGeographyOptionsQuery(options: {
  province?: string;
  enabled?: boolean;
} = {}) {
  return useQuery({
    queryKey: referenceCatalogKeys.options(options.province),
    queryFn: () => listGeographyOptions(options),
    enabled: options.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateProvinceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProvinceMutationInput) => createProvince(data),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useUpdateProvinceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProvinceInput) => updateProvince(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useDeleteProvinceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCatalogInput) => deleteProvince(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useCreateWardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WardMutationInput) => createWard(data),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useUpdateWardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWardInput) => updateWard(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useDeleteWardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCatalogInput) => deleteWard(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useCreateSchoolMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SchoolMutationInput) => createSchool(data),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useUpdateSchoolMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSchoolInput) => updateSchool(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useDeleteSchoolMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCatalogInput) => deleteSchool(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useCreateSchoolAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SchoolAreaMutationInput) => createSchoolArea(data),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useUpdateSchoolAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSchoolAreaInput) => updateSchoolArea(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}

export function useDeleteSchoolAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCatalogInput) => deleteSchoolArea(input),
    onSuccess: () => invalidateReferenceCatalog(queryClient),
  });
}
