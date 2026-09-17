"use client";

import { useQuery } from "@tanstack/react-query";

import { getSessionUsers } from "@/services/api/auth";

export const taskAssigneesKey = ["task-assignees"] as const;

export function useTaskAssigneesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskAssigneesKey,
    queryFn: getSessionUsers,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
