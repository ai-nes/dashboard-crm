"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getLeadAssignmentBatch,
  getLeadAssignmentCatalogs,
  createLeadAssignmentBatch,
  importLeadsToAssignmentBatch,
  listLeadAssignmentBatches,
  previewLeadAssignmentBatch,
  retryLeadAssignmentBatch,
  runLeadAssignmentBatch,
  type CreateLeadAssignmentBatchRequest,
  type ImportLeadAssignmentBatchRequest,
  type LeadAssignmentBatchCatalogParams,
  type LeadAssignmentBatchDetailResponse,
  type LeadAssignmentBatchListParams,
  type LeadAssignmentBatchListResponse,
  type LeadAssignmentBatchMutationResponse,
  type LeadAssignmentCatalogs,
  type LeadAssignmentBatchActionRequest,
  type RetryLeadAssignmentBatchRequest,
} from "@/services/api/lead-sale";

export const leadAssignmentBatchKeys = {
  all: ["lead-sale", "lead-assignment-batch"] as const,
  catalogs: (params: LeadAssignmentBatchCatalogParams = {}) =>
    ["lead-sale", "lead-assignment-batch", "catalogs", params] as const,
  list: (params: LeadAssignmentBatchListParams = {}) =>
    ["lead-sale", "lead-assignment-batch", "list", params] as const,
  detail: (batchId: string) =>
    ["lead-sale", "lead-assignment-batch", "detail", batchId] as const,
};

export function useLeadAssignmentCatalogsQuery(
  params: LeadAssignmentBatchCatalogParams = {},
  options?: Omit<
    UseQueryOptions<
      LeadAssignmentCatalogs,
      Error,
      LeadAssignmentCatalogs,
      ReturnType<typeof leadAssignmentBatchKeys.catalogs>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<LeadAssignmentCatalogs, Error> {
  return useQuery({
    queryKey: leadAssignmentBatchKeys.catalogs(params),
    queryFn: () => getLeadAssignmentCatalogs(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLeadAssignmentBatchListQuery(
  params: LeadAssignmentBatchListParams = {},
  options?: Omit<
    UseQueryOptions<
      LeadAssignmentBatchListResponse,
      Error,
      LeadAssignmentBatchListResponse,
      ReturnType<typeof leadAssignmentBatchKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<LeadAssignmentBatchListResponse, Error> {
  return useQuery({
    queryKey: leadAssignmentBatchKeys.list(params),
    queryFn: () => listLeadAssignmentBatches(params),
    ...options,
  });
}

export function useLeadAssignmentBatchDetailQuery(
  batchId: string | null,
  options?: Omit<
    UseQueryOptions<
      LeadAssignmentBatchDetailResponse,
      Error,
      LeadAssignmentBatchDetailResponse,
      ReturnType<typeof leadAssignmentBatchKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<LeadAssignmentBatchDetailResponse, Error> {
  const id = batchId ?? "";
  return useQuery({
    queryKey: leadAssignmentBatchKeys.detail(id),
    queryFn: () => getLeadAssignmentBatch(id),
    enabled: Boolean(batchId) && (options?.enabled ?? true),
    ...options,
  });
}

function useBatchMutation<
  TVariables,
  TData = LeadAssignmentBatchMutationResponse,
>(mutationFn: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leadAssignmentBatchKeys.all,
      });
    },
  });
}

export function useImportLeadAssignmentBatchMutation() {
  return useBatchMutation<ImportLeadAssignmentBatchRequest>((request) =>
    importLeadsToAssignmentBatch(request, {
      idempotencyKey: `lead-import:${Date.now()}`,
    }),
  );
}

export function useCreateLeadAssignmentBatchMutation() {
  return useBatchMutation<CreateLeadAssignmentBatchRequest>((request) =>
    createLeadAssignmentBatch(request, {
      idempotencyKey: `lead-create:${Date.now()}`,
    }),
  );
}

export function usePreviewLeadAssignmentBatchMutation() {
  return useBatchMutation<LeadAssignmentBatchActionRequest>((request) =>
    previewLeadAssignmentBatch(request, {
      idempotencyKey: `lead-preview:${request.batchId}`,
    }),
  );
}

export function useRunLeadAssignmentBatchMutation() {
  return useBatchMutation<LeadAssignmentBatchActionRequest>((request) =>
    runLeadAssignmentBatch(request, {
      idempotencyKey: `lead-run:${request.batchId}`,
    }),
  );
}

export function useRetryLeadAssignmentBatchMutation() {
  return useBatchMutation<RetryLeadAssignmentBatchRequest>((request) =>
    retryLeadAssignmentBatch(request, {
      idempotencyKey: `lead-retry:${request.batchId}:${request.itemIds?.join(",") ?? "all"}`,
    }),
  );
}
