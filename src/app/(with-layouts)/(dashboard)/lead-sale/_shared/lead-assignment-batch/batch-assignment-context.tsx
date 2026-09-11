"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLeadAssignmentBatchDetailQuery,
  useLeadAssignmentBatchListQuery,
  useLeadAssignmentWorkflowQuery,
  usePreviewLeadAssignmentBatchMutation,
  useRetryLeadAssignmentBatchMutation,
  useRunLeadAssignmentBatchMutation,
  useRunUnassignedLeadAssignmentMutation,
  leadAssignmentBatchKeys,
} from "@/hooks/use-lead-assignment-batch-queries";
import {
  leadSaleLeadsKeys,
  useProcessNewLeadsMutation,
} from "@/hooks/use-lead-sale-leads-queries";
import type {
  LeadAssignmentBatch,
  LeadAssignmentBatchItem,
  LeadAssignmentBatchStatus,
  LeadAssignmentPagination,
  LeadAssignmentWorkflowResponse,
} from "@/services/api/lead-sale";
import { createContext, useContext } from "react";
import {
  batchWorkflowMinimumProcessingDurationMs,
  batchWorkflowLeadProcessingStepDurationMs,
  batchWorkflowLeadProcessingStepIds,
  batchWorkflowProcessingStepDurationMs,
  batchWorkflowProcessingStepIds,
  getBatchWorkflowProcessingStartIndex,
  getBatchWorkflowSteps,
} from "./batch-assignment-workflow-data";

interface BatchAssignmentContextValue {
  batches: LeadAssignmentBatch[];
  selectedBatchId: string | null;
  activeBatch: LeadAssignmentBatch | null;
  workflow: LeadAssignmentWorkflowResponse | null;
  items: LeadAssignmentBatchItem[];
  selectedItemId: string | null;
  selectBatch: (batchId: string) => void;
  inspectItem: (itemId: string | null) => void;
  previewBatch: () => Promise<void>;
  runBatch: () => Promise<void>;
  runUnassignedLeads: () => Promise<void>;
  retryBatch: (itemIds?: string[]) => Promise<void>;
  isLoading: boolean;
  isDetailLoading: boolean;
  isWorkflowLoading: boolean;
  isPreviewing: boolean;
  isRunning: boolean;
  isRunningUnassigned: boolean;
  isProcessingNewLeads: boolean;
  isWorkflowProcessing: boolean;
  processingStepIndex: number | null;
  processNewLeads: () => Promise<void>;
  isRetrying: boolean;
  error: Error | null;
  listPagination: LeadAssignmentPagination | null;
  setPage: (page: number) => void;
  page: number;
  batchFilter: LeadAssignmentBatchStatus | "all";
  setBatchFilter: (status: LeadAssignmentBatchStatus | "all") => void;
  batchQuery: string;
  setBatchQuery: (query: string) => void;
}

const BatchAssignmentContext =
  createContext<BatchAssignmentContextValue | null>(null);

export function BatchAssignmentProvider({ children }: { children: ReactNode }) {
  const [page, setPageState] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [batchFilter, setBatchFilterState] = useState<
    LeadAssignmentBatchStatus | "all"
  >("all");
  const [batchQuery, setBatchQueryState] = useState("");

  const listQuery = useLeadAssignmentBatchListQuery({
    page,
    pageSize: 10,
    status: batchFilter,
    q: batchQuery.trim(),
  });
  const batches = useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data?.items],
  );
  // Do not open an old audit run automatically.  The primary action on this
  // screen is the new system-wide scan; history remains available on demand.
  const effectiveSelectedBatchId = selectedBatchId;
  const detailQuery = useLeadAssignmentBatchDetailQuery(
    effectiveSelectedBatchId,
  );
  const workflowQuery = useLeadAssignmentWorkflowQuery(
    effectiveSelectedBatchId,
  );
  const previewMutation = usePreviewLeadAssignmentBatchMutation();
  const runMutation = useRunLeadAssignmentBatchMutation();
  const runUnassignedMutation = useRunUnassignedLeadAssignmentMutation();
  const processNewLeadsMutation = useProcessNewLeadsMutation();
  const retryMutation = useRetryLeadAssignmentBatchMutation();
  const isMutationRunning =
    runMutation.isPending ||
    runUnassignedMutation.isPending ||
    processNewLeadsMutation.isPending;
  const queryClient = useQueryClient();
  const [processingStepIndex, setProcessingStepIndex] = useState<number | null>(
    null,
  );
  const processingStartedAtRef = useRef<number | null>(null);
  const processingIntervalRef = useRef<number | null>(null);
  const processingFinishTimeoutRef = useRef<number | null>(null);
  const workflowDataRef = useRef(workflowQuery.data);
  const isLeadProcessingRef = useRef(processNewLeadsMutation.isPending);

  useEffect(() => {
    workflowDataRef.current = workflowQuery.data;
  }, [workflowQuery.data]);

  useEffect(() => {
    isLeadProcessingRef.current = processNewLeadsMutation.isPending;
  }, [processNewLeadsMutation.isPending]);

  useEffect(() => {
    if (isMutationRunning) {
      if (processingFinishTimeoutRef.current !== null) {
        window.clearTimeout(processingFinishTimeoutRef.current);
        processingFinishTimeoutRef.current = null;
      }
      if (processingStartedAtRef.current !== null) return;

      processingStartedAtRef.current = Date.now();
      const processingStepIds = isLeadProcessingRef.current
        ? batchWorkflowLeadProcessingStepIds
        : batchWorkflowProcessingStepIds;
      const startIndex = isLeadProcessingRef.current
        ? 0
        : getBatchWorkflowProcessingStartIndex(
            getBatchWorkflowSteps(workflowDataRef.current ?? null),
          );
      const stepDuration = isLeadProcessingRef.current
        ? batchWorkflowLeadProcessingStepDurationMs
        : batchWorkflowProcessingStepDurationMs;
      setProcessingStepIndex(startIndex);
      processingIntervalRef.current = window.setInterval(() => {
        setProcessingStepIndex((current) =>
          current === null
            ? startIndex
            : Math.min(current + 1, processingStepIds.length - 1),
        );
      }, stepDuration);
      return;
    }

    const startedAt = processingStartedAtRef.current;
    if (startedAt === null) return;

    const remaining = Math.max(
      batchWorkflowMinimumProcessingDurationMs - (Date.now() - startedAt),
      0,
    );
    processingFinishTimeoutRef.current = window.setTimeout(() => {
      if (processingIntervalRef.current !== null) {
        window.clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
      processingStartedAtRef.current = null;
      processingFinishTimeoutRef.current = null;
      setProcessingStepIndex(null);
    }, remaining);
  }, [isMutationRunning]);

  useEffect(
    () => () => {
      if (processingIntervalRef.current !== null) {
        window.clearInterval(processingIntervalRef.current);
      }
      if (processingFinishTimeoutRef.current !== null) {
        window.clearTimeout(processingFinishTimeoutRef.current);
      }
    },
    [],
  );
  const activeBatch = useMemo(() => {
    return (
      detailQuery.data?.batch ??
      batches.find((batch) => batch.id === effectiveSelectedBatchId) ??
      null
    );
  }, [batches, detailQuery.data?.batch, effectiveSelectedBatchId]);
  const items = detailQuery.data?.items ?? [];
  const error =
    listQuery.error ?? detailQuery.error ?? workflowQuery.error ?? null;

  const selectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedItemId(null);
  };

  const setBatchFilter = (status: LeadAssignmentBatchStatus | "all") => {
    setBatchFilterState(status);
    setPageState(1);
  };

  const setBatchQuery = (query: string) => {
    setBatchQueryState(query);
    setPageState(1);
  };

  const previewBatch = async () => {
    if (!activeBatch) return;
    try {
      await previewMutation.mutateAsync({ batchId: activeBatch.id });
      toast.success("Đã xem trước kết quả", {
        description:
          "Bạn có thể kiểm tra tỉnh, Team và Sale/CTV trước khi phân công.",
      });
    } catch (mutationError) {
      toast.error("Không thể xem trước đợt Lead", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  const runBatch = async () => {
    if (!activeBatch) return;
    try {
      await runMutation.mutateAsync({ batchId: activeBatch.id });
      toast.success("Đã chạy xong luồng phân công", {
        description: "Hệ thống đã kiểm tra và cập nhật kết quả từng hồ sơ.",
      });
    } catch (mutationError) {
      toast.error("Không thể chạy luồng phân công", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  const runUnassignedLeads = async () => {
    try {
      const result = await runUnassignedMutation.mutateAsync({});
      if (!result.batch) {
        toast.success("Không có Lead mới cần phân công", {
          description:
            result.message ??
            "Mọi Lead hiện tại đã có người phụ trách hoặc đã được xử lý.",
        });
        return;
      }

      // Keep the workspace on the live all-Lead workflow. Selecting the newly
      // created audit batch here would replace the global view with that batch
      // snapshot and make the counters look incomplete after a successful run.
      toast.success("Đã phân công Lead", {
        description: `${result.batch.summary.assigned} Lead đã được giao cho Sale/CTV.`,
      });
    } catch (mutationError) {
      toast.error("Không thể phân công Lead", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  const processNewLeads = async () => {
    try {
      const { summary } = await processNewLeadsMutation.mutateAsync({
        admissionYear: new Date().getFullYear(),
      });
      await queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all });
      await queryClient.invalidateQueries({
        queryKey: leadAssignmentBatchKeys.all,
      });
      toast.success(`Đã xử lý ${summary.scanned} Lead`, {
        description: `${summary.processed} Lead sẵn sàng phân công; ${summary.closed} Lead đã bị loại do thiếu dữ liệu bắt buộc.`,
      });
    } catch (mutationError) {
      toast.error("Không thể xử lý Lead", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  const retryBatch = async (itemIds?: string[]) => {
    if (!activeBatch) return;
    try {
      await retryMutation.mutateAsync({ batchId: activeBatch.id, itemIds });
      toast.success("Đã xử lý lại hồ sơ", {
        description:
          "Đợt Lead đã được cập nhật; kiểm tra lại kết quả sau khi tải xong.",
      });
    } catch (mutationError) {
      toast.error("Không thể xử lý lại đợt Lead", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  return (
    <BatchAssignmentContext.Provider
      value={{
        batches,
        selectedBatchId: effectiveSelectedBatchId,
        activeBatch,
        workflow: workflowQuery.data ?? null,
        items,
        selectedItemId,
        selectBatch,
        inspectItem: setSelectedItemId,
        previewBatch,
        runBatch,
        runUnassignedLeads,
        retryBatch,
        isLoading: listQuery.isLoading,
        isDetailLoading: detailQuery.isLoading,
        isWorkflowLoading: workflowQuery.isLoading,
        isPreviewing: previewMutation.isPending,
        isRunning: runMutation.isPending,
        isRunningUnassigned: runUnassignedMutation.isPending,
        isProcessingNewLeads: processNewLeadsMutation.isPending,
        isWorkflowProcessing: isMutationRunning || processingStepIndex !== null,
        processingStepIndex,
        processNewLeads,
        isRetrying: retryMutation.isPending,
        error,
        listPagination: listQuery.data?.pagination ?? null,
        setPage: (nextPage) => setPageState(Math.max(1, nextPage)),
        page,
        batchFilter,
        setBatchFilter,
        batchQuery,
        setBatchQuery,
      }}
    >
      {children}
    </BatchAssignmentContext.Provider>
  );
}

export function useBatchAssignment() {
  const context = useContext(BatchAssignmentContext);
  if (!context) throw new Error("BatchAssignmentProvider is required");
  return context;
}
