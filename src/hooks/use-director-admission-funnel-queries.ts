"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";

import {
  getDirectorAdmissionFunnel,
  type DirectorAdmissionFunnelParams,
  type DirectorAdmissionFunnelResponse,
} from "@/services/api/director-admission-funnel";

export const directorAdmissionFunnelKeys = {
  all: ["director-admission-funnel"] as const,
  overview: (params?: DirectorAdmissionFunnelParams) => ["director-admission-funnel", "overview", params] as const,
};

export function useDirectorAdmissionFunnelQuery<TData = DirectorAdmissionFunnelResponse>(
  params?: DirectorAdmissionFunnelParams,
  options?: Omit<
    UseQueryOptions<
      DirectorAdmissionFunnelResponse,
      Error,
      TData,
      ReturnType<typeof directorAdmissionFunnelKeys.overview>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: directorAdmissionFunnelKeys.overview(params),
    queryFn: () => getDirectorAdmissionFunnel(params),
    ...options,
  });
}
