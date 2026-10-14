"use client";

import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getInteractionCatalog,
  getInteractionDetail,
  getInteractionNpsPoint,
  getNpsHistory,
  getNpsSaleSummary,
  listInteractions,
  type InteractionCatalog,
  type InteractionDetailResponse,
  type InteractionFeedFilters,
  type InteractionFeedResponse,
  type InteractionNpsPointResponse,
  type NpsHistoryFilters,
  type NpsHistoryResponse,
  type NpsSummaryFilters,
  type NpsSaleSummaryResponse,
} from "@/services/api/interaction-intelligence";

export const interactionIntelligenceKeys = {
  all: ["interaction-intelligence"] as const,
  feed: (studentId: string, filters: InteractionFeedFilters) =>
    ["interaction-intelligence", "feed", studentId, filters] as const,
  detail: (interactionId: string) =>
    ["interaction-intelligence", "detail", interactionId] as const,
  catalog: () => ["interaction-intelligence", "catalog"] as const,
  npsPoint: (viewerKey: string, interactionId: string) =>
    ["interaction-intelligence", "nps-point", viewerKey, interactionId] as const,
  npsSummary: (viewerKey: string, filters: NpsSummaryFilters) =>
    ["interaction-intelligence", "nps-summary", viewerKey, filters] as const,
  npsHistory: (viewerKey: string, filters: Omit<NpsHistoryFilters, "cursor">) =>
    ["interaction-intelligence", "nps-history", viewerKey, filters] as const,
};

export function useInteractionFeedQuery(
  studentId: string,
  filters: InteractionFeedFilters = {},
  enabled = true,
): UseInfiniteQueryResult<InfiniteData<InteractionFeedResponse>, Error> {
  return useInfiniteQuery({
    queryKey: interactionIntelligenceKeys.feed(studentId, filters),
    queryFn: ({ pageParam }) =>
      listInteractions(
        { student: studentId },
        { ...filters, ...(pageParam ? { cursor: pageParam } : {}) },
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(studentId.trim()) && enabled,
    staleTime: 30_000,
  });
}

export function useInteractionDetailQuery(
  interactionId: string | null,
  enabled = true,
): UseQueryResult<InteractionDetailResponse, Error> {
  return useQuery({
    queryKey: interactionIntelligenceKeys.detail(interactionId ?? ""),
    queryFn: () => getInteractionDetail(interactionId ?? ""),
    enabled: Boolean(interactionId) && enabled,
    staleTime: 30_000,
  });
}

export function useInteractionCatalogQuery(
  enabled = true,
): UseQueryResult<InteractionCatalog, Error> {
  return useQuery({
    queryKey: interactionIntelligenceKeys.catalog(),
    queryFn: () => getInteractionCatalog(),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
  });
}

export function useInteractionNpsPointQuery(
  interactionId: string | null,
  enabled = true,
  viewerKey = "",
): UseQueryResult<InteractionNpsPointResponse, Error> {
  return useQuery({
    queryKey: interactionIntelligenceKeys.npsPoint(
      viewerKey,
      interactionId ?? "",
    ),
    queryFn: () => getInteractionNpsPoint(interactionId ?? ""),
    enabled: Boolean(interactionId) && enabled,
    staleTime: 30_000,
  });
}

export function useNpsSaleSummaryQuery(
  filters: NpsSummaryFilters = {},
  enabled = true,
  viewerKey = "",
): UseQueryResult<NpsSaleSummaryResponse, Error> {
  return useQuery({
    queryKey: interactionIntelligenceKeys.npsSummary(viewerKey, filters),
    queryFn: () => getNpsSaleSummary(filters),
    enabled,
    staleTime: 30_000,
  });
}

export function useNpsHistoryQuery(
  filters: NpsHistoryFilters = {},
  enabled = true,
  viewerKey = "",
) {
  const stableFilters: Omit<NpsHistoryFilters, "cursor"> = {
    sale: filters.sale,
    from_date: filters.from_date,
    to_date: filters.to_date,
    limit: filters.limit,
  };
  return useInfiniteQuery({
    queryKey: interactionIntelligenceKeys.npsHistory(viewerKey, stableFilters),
    queryFn: ({ pageParam }) =>
      getNpsHistory({
        ...stableFilters,
        ...(typeof pageParam === "string" ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: NpsHistoryResponse) =>
      lastPage.next_cursor ?? undefined,
    enabled,
    staleTime: 30_000,
  });
}
