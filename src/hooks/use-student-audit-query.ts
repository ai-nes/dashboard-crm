"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getStudentAuditLogs,
  type StudentAuditLogsParams,
  type StudentAuditLogsResponse,
} from "@/services/api/student-audit";

export const studentAuditKeys = {
  all: ["student-audit"] as const,
  list: (params: StudentAuditLogsParams) => ["student-audit", params] as const,
};

export function useStudentAuditLogsQuery<TData = StudentAuditLogsResponse>(
  params: StudentAuditLogsParams,
  options?: Omit<
    UseQueryOptions<
      StudentAuditLogsResponse,
      Error,
      TData,
      ReturnType<typeof studentAuditKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentAuditKeys.list(params),
    queryFn: () => getStudentAuditLogs(params),
    enabled: Boolean(params.student),
    ...options,
  });
}
