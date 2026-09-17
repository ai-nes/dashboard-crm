"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getSaleOverview,
  type SaleOverviewParams,
  type SaleOverviewResponse,
} from "@/services/api/sale";
import { getSaleOverviewMock } from "@/services/api/sale/mock";

const useSaleMock =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_SALE_DASHBOARD_MODE === "mock";

export const saleOverviewKeys = {
  all: ["sale-overview"] as const,
  overview: (params: SaleOverviewParams = {}) =>
    ["sale-overview", "overview", params] as const,
};

export function useSaleOverviewQuery<TData = SaleOverviewResponse>(
  params: SaleOverviewParams = {},
  options?: Omit<
    UseQueryOptions<
      SaleOverviewResponse,
      Error,
      TData,
      ReturnType<typeof saleOverviewKeys.overview>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: saleOverviewKeys.overview(params),
    queryFn: () => (useSaleMock ? getSaleOverviewMock() : getSaleOverview(params)),
    ...options,
  });
}
