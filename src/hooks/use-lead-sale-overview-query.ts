"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getLeadSaleOverview,
  type LeadSaleOverviewParams,
  type LeadSaleOverviewResponse,
} from "@/services/api/lead-sale";

export const leadSaleOverviewKeys = {
  all: ["lead-sale-overview"] as const,
  overview: (params: LeadSaleOverviewParams = {}) =>
    ["lead-sale-overview", "overview", params] as const,
};

export function useLeadSaleOverviewQuery<TData = LeadSaleOverviewResponse>(
  params: LeadSaleOverviewParams = {},
  options?: Omit<
    UseQueryOptions<
      LeadSaleOverviewResponse,
      Error,
      TData,
      ReturnType<typeof leadSaleOverviewKeys.overview>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: leadSaleOverviewKeys.overview(params),
    queryFn: () => getLeadSaleOverview(params),
    ...options,
  });
}
