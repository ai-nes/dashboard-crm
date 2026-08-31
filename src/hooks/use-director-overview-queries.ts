"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { getDirectorOverview } from "@/services/api/director-overview";
import type {
  DirectorOverviewParams,
  DirectorOverviewResponse,
} from "@/services/api/director-overview";

export const directorOverviewKeys = {
  all: ["director-overview"] as const,
  overview: (params?: DirectorOverviewParams) => ["director-overview", "overview", params] as const,
};

export function useDirectorOverviewQuery<TData = DirectorOverviewResponse>(
  params?: DirectorOverviewParams,
  options?: Omit<
    UseQueryOptions<
      DirectorOverviewResponse,
      Error,
      TData,
      ReturnType<typeof directorOverviewKeys.overview>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: directorOverviewKeys.overview(params),
    queryFn: () => getDirectorOverview(params),
    ...options,
  });
}

