"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getDirectorDemographicsOverview,
  getDirectorDemographicsSegment,
} from "@/services/api/demographics";
import type {
  DirectorDemographicsOverviewParams,
  DirectorDemographicsOverviewResponse,
  DirectorDemographicsSegmentParams,
  DirectorDemographicsSegmentResponse,
} from "@/services/api/demographics";

export const demographicsKeys = {
  all: ["demographics"] as const,
  overview: (params?: DirectorDemographicsOverviewParams) => ["demographics", "overview", params] as const,
  segment: (params: DirectorDemographicsSegmentParams) => ["demographics", "segment", params] as const,
};

export function useDirectorDemographicsOverviewQuery<TData = DirectorDemographicsOverviewResponse>(
  params?: DirectorDemographicsOverviewParams,
  options?: Omit<
    UseQueryOptions<
      DirectorDemographicsOverviewResponse,
      Error,
      TData,
      ReturnType<typeof demographicsKeys.overview>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: demographicsKeys.overview(params),
    queryFn: () => getDirectorDemographicsOverview(params),
    ...options,
  });
}

export function useDirectorDemographicsSegmentQuery<TData = DirectorDemographicsSegmentResponse>(
  params: DirectorDemographicsSegmentParams,
  options?: Omit<
    UseQueryOptions<
      DirectorDemographicsSegmentResponse,
      Error,
      TData,
      ReturnType<typeof demographicsKeys.segment>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: demographicsKeys.segment(params),
    queryFn: () => getDirectorDemographicsSegment(params),
    enabled: Boolean(params.segment_id) && (options?.enabled !== false),
    ...options,
  });
}

