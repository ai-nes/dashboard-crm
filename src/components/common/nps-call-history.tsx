"use client";

import { InfoCircle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import type { NpsHistoryPoint } from "@/services/api/interaction-intelligence";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

interface NpsCallHistoryProps {
  items: NpsHistoryPoint[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasMore?: boolean;
  isLoadingMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}

export default function NpsCallHistory({
  items,
  isPending,
  isError,
  errorMessage,
  hasMore,
  isLoadingMore,
  onRetry,
  onLoadMore,
}: NpsCallHistoryProps) {
  return (
    <div className="mt-4">
      {isPending ? (
        <div className="space-y-2" aria-busy="true" aria-label="Đang tải lịch sử NPS">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg bg-badge-error-background p-3 text-sm text-error-600" role="alert">
          <p className="flex items-start gap-2">
            <InfoCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Không thể tải lịch sử cuộc gọi. {errorMessage}</span>
          </p>
          <Button
            type="button"
            appearance="ghost"
            size="sm"
            className="mt-2 min-h-10 px-0"
            onPress={onRetry}
          >
            <RefreshCircle1Clockwise size={16} />
            Thử lại
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-card-border p-4 text-sm text-text-secondary">
          Không có lịch sử cuộc gọi đã chấm trong khoảng đã chọn.
        </p>
      ) : null}

      {!isPending && !isError && items.length > 0 ? (
        <>
          <ul className="divide-y divide-card-border/70 rounded-lg border border-card-border px-3">
            {items.map((item) => (
              <li key={`${item.name}:${item.source_revision ?? 0}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{item.sale}</p>
                  <time className="mt-1 block text-xs text-text-tertiary" dateTime={item.interaction_datetime}>
                    {formatNpsDate(item.interaction_datetime)}
                  </time>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold tabular-nums text-text-primary">
                    {item.total_score.toFixed(1)}<span className="text-xs font-normal text-text-tertiary">/10</span>
                  </p>
                  <p className="text-xs text-text-tertiary">{item.confidence ?? "Chưa có độ tin cậy"}</p>
                </div>
              </li>
            ))}
          </ul>
          {hasMore ? (
            <div className="mt-3 flex justify-center">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                className="min-h-10"
                isDisabled={isLoadingMore}
                onPress={onLoadMore}
              >
                {isLoadingMore ? "Đang tải..." : "Tải thêm lịch sử"}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function formatNpsDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
