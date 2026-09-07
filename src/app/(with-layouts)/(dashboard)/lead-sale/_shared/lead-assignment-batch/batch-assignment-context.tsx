"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  useLeadAssignmentBatchDetailQuery,
  useLeadAssignmentBatchListQuery,
  useRetryLeadAssignmentBatchMutation,
  useRunLeadAssignmentBatchMutation,
} from "@/hooks/use-lead-assignment-batch-queries";
import type {
  LeadAssignmentBatch,
  LeadAssignmentBatchItem,
  LeadAssignmentBatchStatus,
  LeadAssignmentPagination,
} from "@/services/api/lead-sale";
import { createContext, useContext } from "react";

interface BatchAssignmentContextValue {
  batches: LeadAssignmentBatch[];
  selectedBatchId: string | null;
  activeBatch: LeadAssignmentBatch | null;
  items: LeadAssignmentBatchItem[];
  selectedItemId: string | null;
  selectBatch: (batchId: string) => void;
  inspectItem: (itemId: string | null) => void;
  runBatch: () => Promise<void>;
  retryBatch: (itemIds?: string[]) => Promise<void>;
  isLoading: boolean;
  isDetailLoading: boolean;
  isRunning: boolean;
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
  const effectiveSelectedBatchId = selectedBatchId ?? batches[0]?.id ?? null;
  const detailQuery = useLeadAssignmentBatchDetailQuery(
    effectiveSelectedBatchId,
  );
  const runMutation = useRunLeadAssignmentBatchMutation();
  const retryMutation = useRetryLeadAssignmentBatchMutation();
  const activeBatch = useMemo(() => {
    return (
      detailQuery.data?.batch ??
      batches.find((batch) => batch.id === effectiveSelectedBatchId) ??
      null
    );
  }, [batches, detailQuery.data?.batch, effectiveSelectedBatchId]);
  const items = detailQuery.data?.items ?? [];
  const error = listQuery.error ?? detailQuery.error ?? null;

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
        items,
        selectedItemId,
        selectBatch,
        inspectItem: setSelectedItemId,
        runBatch,
        retryBatch,
        isLoading: listQuery.isLoading,
        isDetailLoading: detailQuery.isLoading,
        isRunning: runMutation.isPending,
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
