"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getAudienceInsightsData,
  getCampaignVisitorsData,
  getChannelPerformanceData,
  getConversionFunnelData,
  getMarketingOverviewStats,
  getRecentActivitiesData,
} from "@/services/api/marketing";
import type {
  AudienceInsightsRawResponse,
  CampaignVisitorsRawResponse,
  ChannelPerformanceRawResponse,
  ConversionFunnelRawResponse,
  MarketingOverviewStatsRawResponse,
  MarketingTimeRange,
  RecentActivitiesRawResponse,
} from "@/services/api/marketing";

export const marketingKeys = {
  all: ["marketing"] as const,
  overviewStats: (period: MarketingTimeRange = "7d") => ["marketing-overview-stats", period] as const,
  campaignVisitors: (period: MarketingTimeRange = "7d") => ["campaign-visitors", period] as const,
  audienceInsights: () => ["audience-insights"] as const,
  conversionFunnel: () => ["conversion-funnel"] as const,
  channelPerformance: () => ["channel-performance"] as const,
  recentActivities: () => ["marketing-recent-activities"] as const,
};

export function useMarketingOverviewStatsQuery<TData = MarketingOverviewStatsRawResponse>(
  period: MarketingTimeRange = "7d",
  options?: Omit<UseQueryOptions<MarketingOverviewStatsRawResponse, Error, TData, ReturnType<typeof marketingKeys.overviewStats>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: marketingKeys.overviewStats(period),
    queryFn: () => getMarketingOverviewStats(period),
    ...options,
  });
}

export function useCampaignVisitorsQuery<TData = CampaignVisitorsRawResponse>(
  period: MarketingTimeRange = "7d",
  options?: Omit<UseQueryOptions<CampaignVisitorsRawResponse, Error, TData, ReturnType<typeof marketingKeys.campaignVisitors>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: marketingKeys.campaignVisitors(period),
    queryFn: () => getCampaignVisitorsData(period),
    ...options,
  });
}

export function useAudienceInsightsQuery<TData = AudienceInsightsRawResponse>(
  options?: Omit<UseQueryOptions<AudienceInsightsRawResponse, Error, TData, ReturnType<typeof marketingKeys.audienceInsights>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: marketingKeys.audienceInsights(),
    queryFn: getAudienceInsightsData,
    ...options,
  });
}

export function useConversionFunnelQuery<TData = ConversionFunnelRawResponse>(
  options?: Omit<UseQueryOptions<ConversionFunnelRawResponse, Error, TData, ReturnType<typeof marketingKeys.conversionFunnel>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: marketingKeys.conversionFunnel(),
    queryFn: getConversionFunnelData,
    ...options,
  });
}

export function useChannelPerformanceQuery<TData = ChannelPerformanceRawResponse>(
  options?: Omit<UseQueryOptions<ChannelPerformanceRawResponse, Error, TData, ReturnType<typeof marketingKeys.channelPerformance>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: marketingKeys.channelPerformance(),
    queryFn: getChannelPerformanceData,
    ...options,
  });
}

export function useMarketingRecentActivitiesQuery<TData = RecentActivitiesRawResponse>(
  options?: Omit<UseQueryOptions<RecentActivitiesRawResponse, Error, TData, ReturnType<typeof marketingKeys.recentActivities>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: marketingKeys.recentActivities(),
    queryFn: getRecentActivitiesData,
    ...options,
  });
}

