"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getHomeOverviewStats,
  getInventoryOverviewData,
  getLastTransactionsData,
  getSalesChartData,
  getTopProductsData,
  getTrafficSourcesData,
} from "@/services/api/home";
import type {
  Granularity,
  HomeOverviewStatsRawResponse,
  InventoryOverviewRawResponse,
  LastTransactionsRawResponse,
  SalesChartRawResponse,
  TopProductsRawResponse,
  TrafficSourcesRawResponse,
} from "@/services/api/home";

export const homeKeys = {
  all: ["home"] as const,
  overviewStats: () => ["home-overview-stats"] as const,
  salesChart: (granularity: Granularity = "monthly") => ["home-sales-chart", granularity] as const,
  inventoryOverview: () => ["home-inventory-overview"] as const,
  topProducts: () => ["home-top-products"] as const,
  trafficSources: () => ["home-traffic-sources"] as const,
  lastTransactions: () => ["home-last-transactions"] as const,
};

export function useHomeOverviewStatsQuery<TData = HomeOverviewStatsRawResponse>(
  options?: Omit<UseQueryOptions<HomeOverviewStatsRawResponse, Error, TData, ReturnType<typeof homeKeys.overviewStats>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: homeKeys.overviewStats(),
    queryFn: getHomeOverviewStats,
    ...options,
  });
}

export function useSalesChartQuery<TData = SalesChartRawResponse>(
  granularity: Granularity = "monthly",
  options?: Omit<UseQueryOptions<SalesChartRawResponse, Error, TData, ReturnType<typeof homeKeys.salesChart>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: homeKeys.salesChart(granularity),
    queryFn: () => getSalesChartData(granularity),
    ...options,
  });
}

export function useInventoryOverviewQuery<TData = InventoryOverviewRawResponse>(
  options?: Omit<UseQueryOptions<InventoryOverviewRawResponse, Error, TData, ReturnType<typeof homeKeys.inventoryOverview>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: homeKeys.inventoryOverview(),
    queryFn: getInventoryOverviewData,
    ...options,
  });
}

export function useTopProductsQuery<TData = TopProductsRawResponse>(
  options?: Omit<UseQueryOptions<TopProductsRawResponse, Error, TData, ReturnType<typeof homeKeys.topProducts>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: homeKeys.topProducts(),
    queryFn: getTopProductsData,
    ...options,
  });
}

export function useTrafficSourcesQuery<TData = TrafficSourcesRawResponse>(
  options?: Omit<UseQueryOptions<TrafficSourcesRawResponse, Error, TData, ReturnType<typeof homeKeys.trafficSources>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: homeKeys.trafficSources(),
    queryFn: getTrafficSourcesData,
    ...options,
  });
}

export function useLastTransactionsQuery<TData = LastTransactionsRawResponse>(
  options?: Omit<UseQueryOptions<LastTransactionsRawResponse, Error, TData, ReturnType<typeof homeKeys.lastTransactions>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: homeKeys.lastTransactions(),
    queryFn: getLastTransactionsData,
    ...options,
  });
}

