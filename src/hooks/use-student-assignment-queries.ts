"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getStudentAssignmentDetail,
  getStudentAssignmentWorkspace,
  resolveStudentAssignment,
  type AssignmentDetailResponse,
  type AssignmentWorkspaceResponse,
  type ResolveStudentAssignmentRequest,
  type ResolveStudentAssignmentResponse,
  type StudentAssignmentWorkspaceParams,
} from "@/services/api/lead-sale";

export const studentAssignmentKeys = {
  all: ["lead-sale", "student-assignment"] as const,
  workspace: (params: StudentAssignmentWorkspaceParams = {}) =>
    ["lead-sale", "student-assignment", "workspace", params] as const,
  detail: (studentId: string, admissionYear?: number) =>
    ["lead-sale", "student-assignment", "detail", studentId, admissionYear] as const,
};

export function useStudentAssignmentWorkspaceQuery<TData = AssignmentWorkspaceResponse>(
  params: StudentAssignmentWorkspaceParams = {},
  options?: Omit<
    UseQueryOptions<
      AssignmentWorkspaceResponse,
      Error,
      TData,
      ReturnType<typeof studentAssignmentKeys.workspace>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentAssignmentKeys.workspace(params),
    queryFn: () => getStudentAssignmentWorkspace(params),
    ...options,
  });
}

export function useStudentAssignmentDetailQuery<TData = AssignmentDetailResponse>(
  studentId: string | null,
  admissionYear?: number,
  options?: Omit<
    UseQueryOptions<
      AssignmentDetailResponse,
      Error,
      TData,
      ReturnType<typeof studentAssignmentKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentAssignmentKeys.detail(studentId ?? "", admissionYear),
    queryFn: () => getStudentAssignmentDetail(studentId ?? "", admissionYear),
    enabled: Boolean(studentId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useResolveStudentAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    ResolveStudentAssignmentResponse,
    Error,
    ResolveStudentAssignmentRequest
  >({
    mutationFn: (request) => resolveStudentAssignment(request),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: studentAssignmentKeys.all });
      await queryClient.invalidateQueries({
        queryKey: studentAssignmentKeys.detail(response.studentId, undefined),
      });
    },
  });
}
