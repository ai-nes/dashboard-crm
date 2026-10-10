"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActivityLogs,
  type GetActivityLogsParams,
} from "@/services/api/activity-log";

export function useActivityLogsQuery(
  params: GetActivityLogsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => getActivityLogs(params),
    enabled,
    staleTime: 30_000,
  });
}
