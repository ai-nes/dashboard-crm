"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  useLeadAssignmentBatchDetailQuery,
  useLeadAssignmentBatchListQuery,
  useLeadAssignmentWorkflowQuery,
  usePreviewLeadAssignmentBatchMutation,
  useRetryLeadAssignmentBatchMutation,
  useRunLeadAssignmentBatchMutation,
  useRunUnassignedLeadAssignmentMutation,
} from "@/hooks/use-lead-assignment-batch-queries";
import type {
  LeadAssignmentBatch,
  LeadAssignmentBatchItem,
  LeadAssignmentBatchStatus,
  LeadAssignmentPagination,
  LeadAssignmentWorkflowResponse,
} from "@/services/api/lead-sale";
import { createContext, useContext } from "react";

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
  const retryMutation = useRetryLeadAssignmentBatchMutation();
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

      selectBatch(result.batch.id);
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
