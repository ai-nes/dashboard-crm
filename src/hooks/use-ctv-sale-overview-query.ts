"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getCtvSaleOverview,
  type CtvSaleOverviewParams,
  type CtvSaleOverviewResponse,
} from "@/services/api/ctv-sale";

export const ctvSaleOverviewKeys = {
  all: ["ctv-sale-overview"] as const,
  overview: (params: CtvSaleOverviewParams = {}) =>
    ["ctv-sale-overview", "overview", params] as const,
};

export function useCtvSaleOverviewQuery<TData = CtvSaleOverviewResponse>(
  params: CtvSaleOverviewParams = {},
  options?: Omit<
    UseQueryOptions<
      CtvSaleOverviewResponse,
      Error,
      TData,
      ReturnType<typeof ctvSaleOverviewKeys.overview>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: ctvSaleOverviewKeys.overview(params),
    queryFn: () => getCtvSaleOverview(params),
    ...options,
  });
}
