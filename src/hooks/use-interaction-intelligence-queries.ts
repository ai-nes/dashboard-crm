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
  getInteractionEvidence,
  listInteractions,
  type InteractionCatalog,
  type InteractionDetailResponse,
  type InteractionEvidence,
  type InteractionFeedFilters,
  type InteractionFeedResponse,
} from "@/services/api/interaction-intelligence";

export const interactionIntelligenceKeys = {
  all: ["interaction-intelligence"] as const,
  feed: (studentId: string, filters: InteractionFeedFilters) =>
    ["interaction-intelligence", "feed", studentId, filters] as const,
  detail: (interactionId: string) =>
    ["interaction-intelligence", "detail", interactionId] as const,
  evidence: (evidenceId: string) =>
    ["interaction-intelligence", "evidence", evidenceId] as const,
  catalog: () => ["interaction-intelligence", "catalog"] as const,
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

export function useInteractionEvidenceQuery(
  evidenceId: string | null,
  enabled = false,
): UseQueryResult<InteractionEvidence, Error> {
  return useQuery({
    queryKey: interactionIntelligenceKeys.evidence(evidenceId ?? ""),
    queryFn: () => getInteractionEvidence(evidenceId ?? "", true),
    enabled: Boolean(evidenceId) && enabled,
    staleTime: 60_000,
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
