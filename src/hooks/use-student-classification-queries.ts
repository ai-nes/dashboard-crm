"use client";

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  addStudentTag,
  getStudentClassifications,
  getStudentTagCatalogue,
  listStudentTagGroups,
  removeStudentTag,
  updateStudentTag,
  type StudentClassificationApiError,
  type StudentClassificationsResponse,
  type StudentTagGroup,
  type StudentTagGroupsParams,
  type StudentTagMutationRequest,
  type UpdateStudentTagRequest,
} from "@/services/api/student-classification";

export const studentClassificationKeys = {
  all: ["student-classification"] as const,
  catalogue: ["student-classification", "catalogue"] as const,
  detail: (studentId: string) =>
    ["student-classification", "detail", studentId] as const,
  tagGroups: (params: StudentTagGroupsParams = {}) =>
    ["student-classification", "tag-groups", params] as const,
};

export function useStudentTagCatalogueQuery(enabled: boolean) {
  return useQuery({
    queryKey: studentClassificationKeys.catalogue,
    queryFn: getStudentTagCatalogue,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentClassificationQuery(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      StudentClassificationsResponse,
      StudentClassificationApiError,
      StudentClassificationsResponse,
      ReturnType<typeof studentClassificationKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<
  StudentClassificationsResponse,
  StudentClassificationApiError
> {
  const { enabled = true, ...queryOptions } = options ?? {};

  return useQuery({
    ...queryOptions,
    queryKey: studentClassificationKeys.detail(studentId),
    queryFn: () => getStudentClassifications(studentId),
    enabled: Boolean(studentId) && enabled,
  });
}

export function useStudentTagGroupsQuery(
  params: StudentTagGroupsParams = {},
  options?: Omit<
    UseQueryOptions<
      StudentTagGroup[],
      StudentClassificationApiError,
      StudentTagGroup[],
      ReturnType<typeof studentClassificationKeys.tagGroups>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<StudentTagGroup[], StudentClassificationApiError> {
  const { enabled = true, ...queryOptions } = options ?? {};

  return useQuery({
    ...queryOptions,
    queryKey: studentClassificationKeys.tagGroups(params),
    queryFn: () => listStudentTagGroups(params),
    enabled,
  });
}

export function useAddStudentTagMutation(
  options?: Omit<
    UseMutationOptions<
      StudentClassificationsResponse,
      StudentClassificationApiError,
      StudentTagMutationRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  StudentClassificationsResponse,
  StudentClassificationApiError,
  StudentTagMutationRequest
> {
  return useMutation({
    ...options,
    mutationFn: (request) => addStudentTag(request),
  });
}

export function useRemoveStudentTagMutation(
  options?: Omit<
    UseMutationOptions<
      StudentClassificationsResponse,
      StudentClassificationApiError,
      StudentTagMutationRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  StudentClassificationsResponse,
  StudentClassificationApiError,
  StudentTagMutationRequest
> {
  return useMutation({
    ...options,
    mutationFn: (request) => removeStudentTag(request),
  });
}

export function useUpdateStudentTagMutation(
  options?: Omit<
    UseMutationOptions<
      StudentClassificationsResponse,
      StudentClassificationApiError,
      UpdateStudentTagRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  StudentClassificationsResponse,
  StudentClassificationApiError,
  UpdateStudentTagRequest
> {
  return useMutation({
    ...options,
    mutationFn: (request) => updateStudentTag(request),
  });
}
