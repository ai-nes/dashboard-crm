"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  completeActionManually,
  getStudentWorklistActions,
  startAction,
  type CompleteActionParams,
  type CompleteActionResponse,
  type StartActionParams,
  type StartActionResponse,
  type StudentWorklistActionsResponse,
} from "@/services/api/student-worklist";

export const studentWorklistKeys = {
  all: ["student-worklist"] as const,
  actions: (studentId: string) =>
    ["student-worklist", "actions", studentId] as const,
};

export function useStudentWorklistActionsQuery<
  TData = StudentWorklistActionsResponse,
>(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      StudentWorklistActionsResponse,
      Error,
      TData,
      ReturnType<typeof studentWorklistKeys.actions>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentWorklistKeys.actions(studentId),
    queryFn: () => getStudentWorklistActions(studentId),
    ...options,
  });
}

export function useStartActionMutation(
  studentId: string,
): UseMutationResult<StartActionResponse, Error, StartActionParams> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: StartActionParams) => startAction(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentWorklistKeys.actions(studentId),
      });
    },
  });
}

export function useCompleteActionMutation(
  studentId: string,
): UseMutationResult<CompleteActionResponse, Error, CompleteActionParams> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CompleteActionParams) =>
      completeActionManually(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentWorklistKeys.actions(studentId),
      });
    },
  });
}
