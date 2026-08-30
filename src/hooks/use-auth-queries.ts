"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { getCurrentUser, type CurrentUser } from "@/services/api/auth";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => ["auth", "current-user"] as const,
};

export function useCurrentUserQuery<TData = CurrentUser | null>(
  options?: Omit<
    UseQueryOptions<CurrentUser | null, Error, TData, ReturnType<typeof authKeys.currentUser>>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
}
