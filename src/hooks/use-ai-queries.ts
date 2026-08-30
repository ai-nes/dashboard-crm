"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getAiAgentsData,
  getAiCostAnalyticsData,
  getAiProviderDistributionData,
  getRecentActivitiesData,
  getTopUsageData,
  getWeeklyAiActivityData,
} from "@/services/api/ai";
import type {
  AiAgentsRawResponse,
  AiCostAnalyticsRawResponse,
  AiGranularity,
  AiProviderDistributionRawResponse,
  RecentActivitiesRawResponse,
  TopUsageRawResponse,
  WeeklyAiActivityRawResponse,
} from "@/services/api/ai";

export const aiKeys = {
  all: ["ai"] as const,
  costAnalytics: (granularity: AiGranularity = "monthly") => ["ai-cost-analytics", granularity] as const,
  weeklyActivity: () => ["weekly-ai-activity"] as const,
  topUsage: () => ["top-usage"] as const,
  agents: () => ["ai-agents"] as const,
  recentActivities: () => ["ai-recent-activities"] as const,
  providerDistribution: () => ["ai-provider-distribution"] as const,
};

export function useAiCostAnalyticsQuery<TData = AiCostAnalyticsRawResponse>(
  granularity: AiGranularity = "monthly",
  options?: Omit<UseQueryOptions<AiCostAnalyticsRawResponse, Error, TData, ReturnType<typeof aiKeys.costAnalytics>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: aiKeys.costAnalytics(granularity),
    queryFn: () => getAiCostAnalyticsData(granularity),
    ...options,
  });
}

export function useWeeklyAiActivityQuery<TData = WeeklyAiActivityRawResponse>(
  options?: Omit<UseQueryOptions<WeeklyAiActivityRawResponse, Error, TData, ReturnType<typeof aiKeys.weeklyActivity>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: aiKeys.weeklyActivity(),
    queryFn: getWeeklyAiActivityData,
    ...options,
  });
}

export function useTopUsageQuery<TData = TopUsageRawResponse>(
  options?: Omit<UseQueryOptions<TopUsageRawResponse, Error, TData, ReturnType<typeof aiKeys.topUsage>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: aiKeys.topUsage(),
    queryFn: getTopUsageData,
    ...options,
  });
}

export function useAiAgentsQuery<TData = AiAgentsRawResponse>(
  options?: Omit<UseQueryOptions<AiAgentsRawResponse, Error, TData, ReturnType<typeof aiKeys.agents>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: aiKeys.agents(),
    queryFn: getAiAgentsData,
    ...options,
  });
}

export function useAiRecentActivitiesQuery<TData = RecentActivitiesRawResponse>(
  options?: Omit<UseQueryOptions<RecentActivitiesRawResponse, Error, TData, ReturnType<typeof aiKeys.recentActivities>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: aiKeys.recentActivities(),
    queryFn: getRecentActivitiesData,
    ...options,
  });
}

export function useAiProviderDistributionQuery<TData = AiProviderDistributionRawResponse>(
  options?: Omit<UseQueryOptions<AiProviderDistributionRawResponse, Error, TData, ReturnType<typeof aiKeys.providerDistribution>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: aiKeys.providerDistribution(),
    queryFn: getAiProviderDistributionData,
    ...options,
  });
}

