"use client";

import { ArrowLeft, ArrowRight, Close, Search1 } from "@tailgrids/icons";
import Link from "next/link";
import { Label } from "react-aria-components";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import { cn } from "@/utils/cn";
import { useBatchAssignment } from "../../_shared/lead-assignment-batch/batch-assignment-context";
import {
  batchStatusColors,
  batchStatusLabels,
  formatCount,
  formatDateTime,
} from "../../_shared/lead-assignment-batch/batch-assignment-mappings";

const statusFilters = [
  { id: "all", label: "Tất cả" },
  { id: "draft", label: "Bản nháp" },
  { id: "ready", label: "Đã kiểm tra" },
  { id: "running", label: "Đang xử lý" },
  { id: "completed", label: "Hoàn tất" },
  { id: "completed_with_errors", label: "Có hồ sơ cần xử lý" },
] as const;

export default function AssignmentBatchHistory({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    batches,
    selectedBatchId,
    selectBatch,
    isLoading,
    batchFilter,
    setBatchFilter,
    batchQuery,
    setBatchQuery,
    listPagination,
    page,
    setPage,
  } = useBatchAssignment();
  const visibleBatches = compact ? batches.slice(0, 5) : batches;

  return (
    <section aria-labelledby="batch-history-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="batch-history-heading"
            className="text-base font-semibold text-text-primary"
          >
            {compact ? "Đợt gần đây" : "Lịch sử đợt phân công"}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi từng đợt Lead và kết quả phân công.
          </p>
        </div>
        {compact && (
          <Link
            href="/lead-sale/assignment-history"
            className="text-sm font-medium text-button-primary-outline-text hover:underline"
          >
            Xem tất cả
          </Link>
        )}
      </div>

      {!compact && (
        <div className="space-y-3">
          <TextField
            value={batchQuery}
            onChange={setBatchQuery}
            className="w-full sm:w-80"
          >
            <Label className="sr-only">Tìm theo tên đợt</Label>
            <div className="relative">
              <Search1
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
              />
              <Input
                placeholder="Tìm tên đợt…"
                className="h-10 w-full pr-8 pl-9 text-sm"
              />
              {batchQuery && (
                <Button
                  iconOnly
                  appearance="ghost"
                  size="xs"
                  aria-label="Xóa tìm kiếm"
                  className="absolute top-1.5 right-1 text-text-tertiary"
                  onPress={() => setBatchQuery("")}
                >
                  <Close size={13} aria-hidden="true" />
                </Button>
              )}
            </div>
          </TextField>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Lọc trạng thái đợt"
          >
            {statusFilters.map((filter) => (
              <Button
                key={filter.id}
                appearance="ghost"
                size="sm"
                aria-pressed={batchFilter === filter.id}
                className={cn(
                  "text-text-secondary",
                  batchFilter === filter.id &&
                    "bg-badge-primary-background text-badge-primary-text",
                )}
                onPress={() => setBatchFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-card-border">
          {visibleBatches.map((batch) => (
            <button
              type="button"
              key={batch.id}
              onClick={() => selectBatch(batch.id)}
              className={cn(
                "flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-background-gray-secondary/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring/30",
                selectedBatchId === batch.id &&
                  "bg-badge-primary-background/40",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">
                  {batch.batchName}
                </span>
                <span className="mt-1 block text-xs text-text-tertiary">
                  {formatDateTime(batch.createdAt)} ·{" "}
                  {formatCount(batch.itemCount)} hồ sơ Lead
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="hidden text-xs text-text-tertiary sm:inline">
                  {formatCount(batch.summary.assigned)} đã giao
                </span>
                <Badge color={batchStatusColors[batch.status]}>
                  {batchStatusLabels[batch.status]}
                </Badge>
              </span>
            </button>
          ))}
        </div>
        {!visibleBatches.length && (
          <div className="px-5 py-10 text-center">
            <Search1
              size={24}
              className="mx-auto text-text-tertiary"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-text-primary">
              {isLoading ? "Đang tải lịch sử…" : "Chưa có đợt phù hợp"}
            </p>
            {!isLoading && (
              <p className="mt-1 text-xs text-text-tertiary">
                Đợt sẽ xuất hiện sau khi được tạo từ luồng tiếp nhận Lead.
              </p>
            )}
          </div>
        )}
        {!compact && listPagination && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-5 py-3">
            <p className="text-xs text-text-tertiary" aria-live="polite">
              {listPagination.total
                ? `${(page - 1) * listPagination.pageSize + 1} đến ${Math.min(page * listPagination.pageSize, listPagination.total)} trong ${listPagination.total} đợt`
                : "0 đợt"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                appearance="outline"
                size="sm"
                iconOnly
                aria-label="Trang trước"
                className="border-card-border text-text-secondary"
                isDisabled={page <= 1 || isLoading}
                onPress={() => setPage(page - 1)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums text-text-secondary">
                {page} / {Math.max(1, listPagination.totalPages)}
              </span>
              <Button
                appearance="outline"
                size="sm"
                iconOnly
                aria-label="Trang sau"
                className="border-card-border text-text-secondary"
                isDisabled={!listPagination.hasNextPage || isLoading}
                onPress={() => setPage(page + 1)}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
