"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getLeadGrowthData,
  getLeadsReportData,
  getRecentActivitiesData,
  getUpcomingTasksData,
} from "@/services/api/crm";
import type {
  LeadGrowthGranularity,
  LeadGrowthRawResponse,
  LeadsReportRawResponse,
  RecentActivitiesRawResponse,
  UpcomingTasksRawResponse,
} from "@/services/api/crm";

export const crmKeys = {
  all: ["crm"] as const,
  leadGrowth: (granularity: LeadGrowthGranularity = "7d") => ["crm-lead-growth", granularity] as const,
  leadsReport: () => ["crm-leads-report"] as const,
  upcomingTasks: () => ["crm-upcoming-tasks"] as const,
  recentActivities: () => ["crm-recent-activities"] as const,
};

export function useLeadGrowthQuery<TData = LeadGrowthRawResponse>(
  granularity: LeadGrowthGranularity = "7d",
  options?: Omit<UseQueryOptions<LeadGrowthRawResponse, Error, TData, ReturnType<typeof crmKeys.leadGrowth>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmKeys.leadGrowth(granularity),
    queryFn: () => getLeadGrowthData(granularity),
    ...options,
  });
}

export function useLeadsReportQuery<TData = LeadsReportRawResponse>(
  options?: Omit<UseQueryOptions<LeadsReportRawResponse, Error, TData, ReturnType<typeof crmKeys.leadsReport>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmKeys.leadsReport(),
    queryFn: getLeadsReportData,
    ...options,
  });
}

export function useUpcomingTasksQuery<TData = UpcomingTasksRawResponse>(
  options?: Omit<UseQueryOptions<UpcomingTasksRawResponse, Error, TData, ReturnType<typeof crmKeys.upcomingTasks>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmKeys.upcomingTasks(),
    queryFn: getUpcomingTasksData,
    ...options,
  });
}

export function useCrmRecentActivitiesQuery<TData = RecentActivitiesRawResponse>(
  options?: Omit<UseQueryOptions<RecentActivitiesRawResponse, Error, TData, ReturnType<typeof crmKeys.recentActivities>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmKeys.recentActivities(),
    queryFn: getRecentActivitiesData,
    ...options,
  });
}

