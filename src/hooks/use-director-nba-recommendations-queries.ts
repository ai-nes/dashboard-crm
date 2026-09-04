"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getDirectorNbaRecommendations,
  type DirectorNbaRecommendationsParams,
  type DirectorNbaRecommendationsResponse,
} from "@/services/api/nba";

export const directorNbaRecommendationsKeys = {
  all: ["director-nba-recommendations"] as const,
  list: (params?: DirectorNbaRecommendationsParams) =>
    ["director-nba-recommendations", "list", params] as const,
};

export function useDirectorNbaRecommendationsQuery<
  TData = DirectorNbaRecommendationsResponse,
>(
  params?: DirectorNbaRecommendationsParams,
  options?: Omit<
    UseQueryOptions<
      DirectorNbaRecommendationsResponse,
      Error,
      TData,
      ReturnType<typeof directorNbaRecommendationsKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: directorNbaRecommendationsKeys.list(params),
    queryFn: () => getDirectorNbaRecommendations(params),
    staleTime: 30_000,
    ...options,
  });
}
