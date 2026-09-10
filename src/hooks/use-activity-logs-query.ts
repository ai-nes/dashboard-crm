"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActivityLogs,
  type GetActivityLogsParams,
} from "@/services/api/activity-log";

export function useActivityLogsQuery(params: GetActivityLogsParams) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => getActivityLogs(params),
    staleTime: 30_000,
  });
}
