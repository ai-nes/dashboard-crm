"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getTopChannelsData,
  getTopContentData,
  getTopCountriesData,
  getUsedDevicesData,
  getVisitorsAnalyticsData,
} from "@/services/api/analytics";
import type {
  AnalyticsGranularity,
  TopChannelsRawResponse,
  TopContentRawResponse,
  TopCountriesRawResponse,
  UsedDevicesRawResponse,
  VisitorsAnalyticsRawResponse,
} from "@/services/api/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  visitors: (granularity: AnalyticsGranularity = "monthly") => ["analytics-visitors", granularity] as const,
  usedDevices: () => ["used-devices"] as const,
  topCountries: () => ["top-countries"] as const,
  topContent: () => ["top-content"] as const,
  topChannels: () => ["top-channels"] as const,
};

export function useVisitorsAnalyticsQuery<TData = VisitorsAnalyticsRawResponse>(
  granularity: AnalyticsGranularity = "monthly",
  options?: Omit<UseQueryOptions<VisitorsAnalyticsRawResponse, Error, TData, ReturnType<typeof analyticsKeys.visitors>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: analyticsKeys.visitors(granularity),
    queryFn: () => getVisitorsAnalyticsData(granularity),
    ...options,
  });
}

export function useUsedDevicesQuery<TData = UsedDevicesRawResponse>(
  options?: Omit<UseQueryOptions<UsedDevicesRawResponse, Error, TData, ReturnType<typeof analyticsKeys.usedDevices>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: analyticsKeys.usedDevices(),
    queryFn: getUsedDevicesData,
    ...options,
  });
}

export function useTopCountriesQuery<TData = TopCountriesRawResponse>(
  options?: Omit<UseQueryOptions<TopCountriesRawResponse, Error, TData, ReturnType<typeof analyticsKeys.topCountries>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: analyticsKeys.topCountries(),
    queryFn: getTopCountriesData,
    ...options,
  });
}

export function useTopContentQuery<TData = TopContentRawResponse>(
  options?: Omit<UseQueryOptions<TopContentRawResponse, Error, TData, ReturnType<typeof analyticsKeys.topContent>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: analyticsKeys.topContent(),
    queryFn: getTopContentData,
    ...options,
  });
}

export function useTopChannelsQuery<TData = TopChannelsRawResponse>(
  options?: Omit<UseQueryOptions<TopChannelsRawResponse, Error, TData, ReturnType<typeof analyticsKeys.topChannels>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: analyticsKeys.topChannels(),
    queryFn: getTopChannelsData,
    ...options,
  });
}

