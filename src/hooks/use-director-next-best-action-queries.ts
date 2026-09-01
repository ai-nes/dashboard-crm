"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getDirectorNextBestAction,
  type DirectorNextBestActionParams,
  type DirectorNextBestActionResponse,
} from "@/services/api/director-next-best-action";

export const directorNextBestActionKeys = {
  all: ["director-next-best-action"] as const,
  snapshot: (params?: DirectorNextBestActionParams) =>
    ["director-next-best-action", "snapshot", params] as const,
};

export function useDirectorNextBestActionQuery<
  TData = DirectorNextBestActionResponse,
>(
  params?: DirectorNextBestActionParams,
  options?: Omit<
    UseQueryOptions<
      DirectorNextBestActionResponse,
      Error,
      TData,
      ReturnType<typeof directorNextBestActionKeys.snapshot>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: directorNextBestActionKeys.snapshot(params),
    queryFn: () => getDirectorNextBestAction(params),
    ...options,
  });
}
