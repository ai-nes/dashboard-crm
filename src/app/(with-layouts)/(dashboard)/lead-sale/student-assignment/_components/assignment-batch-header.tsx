"use client";

import { ArrowRight, Play } from "@tailgrids/icons";
import Link from "next/link";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button, buttonStyles } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import { useBatchAssignment } from "../../_shared/lead-assignment-batch/batch-assignment-context";
import {
  batchStatusColors,
  batchStatusLabels,
  formatDateTime,
} from "../../_shared/lead-assignment-batch/batch-assignment-mappings";

export default function AssignmentBatchHeader() {
  const {
    activeBatch,
    isLoading,
    runUnassignedLeads,
    isRunningUnassigned,
  } = useBatchAssignment();

  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-text-tertiary">
            <span>VẬN HÀNH TUYỂN SINH</span>
            <span aria-hidden="true">/</span>
            <span>PHÂN CÔNG LEAD</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">
            Phân công tự động
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Hệ thống sẽ quét các Lead chưa có người phụ trách và phân công theo
            cấu hình hiện tại.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="md"
            onPress={() => void runUnassignedLeads()}
            isDisabled={isRunningUnassigned}
          >
            <Play size={15} aria-hidden="true" />
            {isRunningUnassigned ? "Đang phân công…" : "Phân công Lead"}
          </Button>
          <Link
            href="/lead-sale/assignment-history"
            className={cn(
              buttonStyles({
                variant: "primary",
                appearance: "outline",
                size: "md",
              }),
              "border-card-border text-text-secondary",
            )}
          >
            Lịch sử chạy <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-card-border bg-card-background px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-tertiary">
            LẦN CHẠY GẦN NHẤT
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-text-primary">
            {isLoading
              ? "Đang tải kết quả…"
              : (activeBatch?.batchName ?? "Chưa có lần chạy")}
          </p>
          {activeBatch && (
            <p className="mt-1 text-xs text-text-tertiary">
              Tạo lúc {formatDateTime(activeBatch.createdAt)} ·{" "}
              {activeBatch.itemCount} hồ sơ Lead
            </p>
          )}
        </div>
        {activeBatch ? (
          <Badge color={batchStatusColors[activeBatch.status]}>
            {batchStatusLabels[activeBatch.status]}
          </Badge>
        ) : (
          <span className="text-sm text-text-tertiary">
            Chưa chọn lần chạy. Bấm “Phân công Lead” để quét hệ thống
          </span>
        )}
      </div>
    </header>
  );
}
