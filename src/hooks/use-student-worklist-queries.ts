"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getStudentWorklistActions,
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
