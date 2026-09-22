"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getStudentScoreContext,
  type StudentScoreContext,
} from "@/services/api/student-score-context";

export const studentScoreContextKeys = {
  all: ["student-score-context"] as const,
  detail: (studentId: string) => ["student-score-context", studentId] as const,
};

export function useStudentScoreContextQuery<TData = StudentScoreContext>(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      StudentScoreContext,
      Error,
      TData,
      ReturnType<typeof studentScoreContextKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentScoreContextKeys.detail(studentId),
    queryFn: () => getStudentScoreContext(studentId),
    enabled: Boolean(studentId) && options?.enabled !== false,
    staleTime: 60_000,
    ...options,
  });
}
