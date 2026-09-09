"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSegment,
  deleteSegment,
  getSegment,
  getSegmentFilterOptions,
  listSegments,
  previewSegment,
  transitionSegment,
  updateSegment,
  type CreateSegmentPayload,
  type DeleteSegmentPayload,
  type ListSegmentsParams,
  type SegmentPreviewParams,
  type TransitionSegmentPayload,
  type UpdateSegmentPayload,
} from "@/services/api/segments";

export const segmentKeys = {
  all: ["segments"] as const,
  list: (params: ListSegmentsParams = {}) =>
    ["segments", "list", params] as const,
  detail: (name: string) => ["segments", "detail", name] as const,
  detailByCode: (segmentCode: string) =>
    ["segments", "detail-by-code", segmentCode] as const,
  preview: (params: SegmentPreviewParams) =>
    ["segments", "preview", params] as const,
  filterOptions: ["segments", "filter-options"] as const,
};

export function useSegmentsQuery(params: ListSegmentsParams = {}) {
  return useQuery({
    queryKey: segmentKeys.list(params),
    queryFn: () => listSegments(params),
    staleTime: 30_000,
  });
}

export function useSegmentDetailQuery(name: string) {
  return useQuery({
    queryKey: segmentKeys.detail(name),
    queryFn: () => getSegment(name),
    enabled: Boolean(name),
  });
}

export function useSegmentByCodeQuery(segmentCode: string) {
  return useQuery({
    queryKey: segmentKeys.detailByCode(segmentCode),
    queryFn: async () => {
      const segments = await listSegments({ pageLength: 1000 });
      const segment = segments.find(
        (candidate) => candidate.segment_code === segmentCode,
      );

      if (!segment) {
        throw new Error("Không tìm thấy segment với mã đã chọn.");
      }

      return getSegment(segment.name);
    },
    enabled: Boolean(segmentCode),
  });
}

export function useSegmentPreviewQuery(
  params: SegmentPreviewParams,
  enabled = true,
) {
  return useQuery({
    queryKey: segmentKeys.preview(params),
    queryFn: () => previewSegment(params),
    enabled,
    staleTime: 5_000,
  });
}

export function useSegmentFilterOptionsQuery() {
  return useQuery({
    queryKey: segmentKeys.filterOptions,
    queryFn: () => getSegmentFilterOptions(),
    staleTime: 5 * 60_000,
  });
}

function invalidateSegments(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: segmentKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["segments", "preview"] }),
  ]);
}

export function useCreateSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSegmentPayload) => createSegment(payload),
    onSuccess: () => invalidateSegments(queryClient),
  });
}

export function useUpdateSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSegmentPayload) => updateSegment(payload),
    onSuccess: (_, variables) =>
      Promise.all([
        invalidateSegments(queryClient),
        queryClient.invalidateQueries({
          queryKey: segmentKeys.detail(variables.name),
        }),
      ]),
  });
}

export function useTransitionSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransitionSegmentPayload) =>
      transitionSegment(payload),
    onSuccess: (_, variables) =>
      Promise.all([
        invalidateSegments(queryClient),
        queryClient.invalidateQueries({
          queryKey: segmentKeys.detail(variables.name),
        }),
      ]),
  });
}

export function useDeleteSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteSegmentPayload) => deleteSegment(payload),
    onSuccess: (_, variables) =>
      Promise.all([
        invalidateSegments(queryClient),
        queryClient.removeQueries({
          queryKey: segmentKeys.detail(variables.name),
        }),
      ]),
  });
}
