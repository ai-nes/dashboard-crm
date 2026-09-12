"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSegment,
  deleteSegment,
  getSegment,
  getSegmentByCode,
  getSegmentAnalysis,
  getSegmentFilterOptions,
  listSegmentsPage,
  previewSegment,
  transitionSegment,
  updateSegment,
  createClassificationGroup,
  deleteClassificationGroup,
  listClassificationGroupsPage,
  transitionClassificationGroup,
  updateClassificationGroup,
  createClassificationTerm,
  deleteClassificationTerm,
  listClassificationTermsPage,
  transitionClassificationTerm,
  updateClassificationTerm,
  type ClassificationGroupKind,
  type ClassificationGroupPayload,
  type DeleteClassificationGroupPayload,
  type TransitionClassificationGroupPayload,
  type UpdateClassificationGroupPayload,
  type ClassificationTermPayload,
  type DeleteClassificationTermPayload,
  type TransitionClassificationTermPayload,
  type UpdateClassificationTermPayload,
  type CreateSegmentPayload,
  type DeleteSegmentPayload,
  type ListSegmentsParams,
  type SegmentPreviewParams,
  type TransitionSegmentPayload,
  type UpdateSegmentPayload,
} from "@/services/api/segments";

export type { ClassificationGroupKind } from "@/services/api/segments";

export const segmentKeys = {
  all: ["segments"] as const,
  list: (params: ListSegmentsParams = {}) =>
    ["segments", "list", params] as const,
  visibleList: ["segments", "visible-list"] as const,
  detail: (name: string) => ["segments", "detail", name] as const,
  detailByCode: (segmentCode: string) =>
    ["segments", "detail-by-code", segmentCode] as const,
  analysis: (selectedSegmentCodes: string[]) =>
    ["segments", "analysis", selectedSegmentCodes] as const,
  preview: (params: SegmentPreviewParams) =>
    ["segments", "preview", params] as const,
  filterOptions: ["segments", "filter-options"] as const,
  groups: (
    kind: ClassificationGroupKind,
    params: Record<string, unknown> = {},
  ) => ["segments", "groups", kind, params] as const,
  terms: (
    kind: ClassificationGroupKind,
    params: Record<string, unknown> = {},
  ) => ["segments", "terms", kind, params] as const,
};

export function useClassificationGroupsQuery(
  kind: ClassificationGroupKind,
  params: { status?: string; start?: number; pageLength?: number } = {},
) {
  return useQuery({
    queryKey: segmentKeys.groups(kind, params),
    queryFn: () => listClassificationGroupsPage(kind, params),
    staleTime: 30_000,
  });
}

export function useClassificationTermsQuery(
  kind: ClassificationGroupKind,
  params: {
    status?: string;
    group?: string;
    start?: number;
    pageLength?: number;
  } = {},
) {
  return useQuery({
    queryKey: segmentKeys.terms(kind, params),
    queryFn: () => listClassificationTermsPage(kind, params),
    staleTime: 30_000,
  });
}

export function useCreateClassificationTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: ClassificationTermPayload;
    }) => createClassificationTerm(kind, payload),
    onSuccess: (_, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: segmentKeys.terms(variables.kind),
        }),
        queryClient.invalidateQueries({
          queryKey: segmentKeys.groups(variables.kind),
        }),
      ]),
  });
}

export function useUpdateClassificationTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: UpdateClassificationTermPayload;
    }) => updateClassificationTerm(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.terms(variables.kind),
      }),
  });
}

export function useTransitionClassificationTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: TransitionClassificationTermPayload;
    }) => transitionClassificationTerm(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.terms(variables.kind),
      }),
  });
}

export function useDeleteClassificationTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: DeleteClassificationTermPayload;
    }) => deleteClassificationTerm(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.terms(variables.kind),
      }),
  });
}

export function useCreateClassificationGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: ClassificationGroupPayload;
    }) => createClassificationGroup(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.groups(variables.kind),
      }),
  });
}

export function useUpdateClassificationGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: UpdateClassificationGroupPayload;
    }) => updateClassificationGroup(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.groups(variables.kind),
      }),
  });
}

export function useTransitionClassificationGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: TransitionClassificationGroupPayload;
    }) => transitionClassificationGroup(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.groups(variables.kind),
      }),
  });
}

export function useDeleteClassificationGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      payload,
    }: {
      kind: ClassificationGroupKind;
      payload: DeleteClassificationGroupPayload;
    }) => deleteClassificationGroup(kind, payload),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: segmentKeys.groups(variables.kind),
      }),
  });
}

export function useSegmentsQuery(
  params: ListSegmentsParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: segmentKeys.list(params),
    queryFn: () => listSegmentsPage(params),
    staleTime: 30_000,
    enabled: options.enabled ?? true,
  });
}

async function listRoleVisibleSegments() {
  const analysis = await getSegmentAnalysis();

  return analysis.segments.filter((segment) => segment.member_count > 0);
}

/** Lists only segments containing students visible in the current session. */
export function useVisibleSegmentsQuery(enabled = true) {
  return useQuery({
    queryKey: segmentKeys.visibleList,
    queryFn: listRoleVisibleSegments,
    staleTime: 30_000,
    enabled,
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
    queryFn: () => getSegmentByCode(segmentCode),
    enabled: Boolean(segmentCode),
  });
}

export function useSegmentAnalysisQuery(
  selectedSegmentCodes: string[] = [],
  enabled = true,
) {
  return useQuery({
    queryKey: segmentKeys.analysis(selectedSegmentCodes),
    queryFn: () => getSegmentAnalysis(selectedSegmentCodes),
    enabled,
    staleTime: 30_000,
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
