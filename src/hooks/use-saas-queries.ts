"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getCustomerGrowthData,
  getPlanMixData,
  getRecentActivitiesData,
  getRecentSignupsData,
  getRevenueOverviewData,
} from "@/services/api/saas";
import type {
  CustomerGrowthRawResponse,
  Granularity,
  PlanMixRawResponse,
  RecentActivitiesRawResponse,
  RecentSignupsRawResponse,
  RevenueOverviewRawResponse,
} from "@/services/api/saas";

export const saasKeys = {
  all: ["saas"] as const,
  revenueOverview: (granularity: Granularity = "monthly") => ["saas-revenue-overview", granularity] as const,
  customerGrowth: (granularity: Granularity = "monthly") => ["saas-customer-growth", granularity] as const,
  planMix: () => ["saas-plan-mix"] as const,
  recentSignups: () => ["saas-recent-signups"] as const,
  recentActivities: () => ["saas-recent-activities"] as const,
};

export function useRevenueOverviewQuery<TData = RevenueOverviewRawResponse>(
  granularity: Granularity = "monthly",
  options?: Omit<UseQueryOptions<RevenueOverviewRawResponse, Error, TData, ReturnType<typeof saasKeys.revenueOverview>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: saasKeys.revenueOverview(granularity),
    queryFn: () => getRevenueOverviewData(granularity),
    ...options,
  });
}

export function useCustomerGrowthQuery<TData = CustomerGrowthRawResponse>(
  granularity: Granularity = "monthly",
  options?: Omit<UseQueryOptions<CustomerGrowthRawResponse, Error, TData, ReturnType<typeof saasKeys.customerGrowth>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: saasKeys.customerGrowth(granularity),
    queryFn: () => getCustomerGrowthData(granularity),
    ...options,
  });
}

export function usePlanMixQuery<TData = PlanMixRawResponse>(
  options?: Omit<UseQueryOptions<PlanMixRawResponse, Error, TData, ReturnType<typeof saasKeys.planMix>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: saasKeys.planMix(),
    queryFn: getPlanMixData,
    ...options,
  });
}

export function useRecentSignupsQuery<TData = RecentSignupsRawResponse>(
  options?: Omit<UseQueryOptions<RecentSignupsRawResponse, Error, TData, ReturnType<typeof saasKeys.recentSignups>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: saasKeys.recentSignups(),
    queryFn: getRecentSignupsData,
    ...options,
  });
}

export function useSaasRecentActivitiesQuery<TData = RecentActivitiesRawResponse>(
  options?: Omit<UseQueryOptions<RecentActivitiesRawResponse, Error, TData, ReturnType<typeof saasKeys.recentActivities>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: saasKeys.recentActivities(),
    queryFn: getRecentActivitiesData,
    ...options,
  });
}

