"use client";

import { ArrowRight, Play } from "@tailgrids/icons";
import Link from "next/link";
import { Button, buttonStyles } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import { useLeadSaleLeadsQuery } from "@/hooks/use-lead-sale-leads-queries";
import { useBatchAssignment } from "../../_shared/lead-assignment-batch/batch-assignment-context";

const currentAdmissionYear = new Date().getFullYear();

export default function AssignmentBatchHeader() {
  const {
    workflow,
    isWorkflowLoading,
    isWorkflowProcessing,
    isProcessingNewLeads,
    processNewLeads,
    runUnassignedLeads,
  } = useBatchAssignment();
  const leadIntakeQuery = useLeadSaleLeadsQuery({
    admissionYear: currentAdmissionYear,
    page: 1,
    pageSize: 1,
  });
  const hasPendingLeads = (workflow?.pendingCount ?? 0) > 0;
  const pendingNewCount = leadIntakeQuery.data?.meta.pendingNew ?? 0;
  const hasPendingNewLeads = pendingNewCount > 0;
  const isIntakeLoading = leadIntakeQuery.isPending;

  const isActionDisabled =
    isWorkflowLoading ||
    isWorkflowProcessing ||
    isIntakeLoading ||
    isProcessingNewLeads ||
    (!hasPendingNewLeads && !hasPendingLeads);

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
            Phân công Lead
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Hệ thống sẽ quét các Lead đã xử lý mà chưa có người phụ trách và
            phân công theo cấu hình hiện tại.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="md"
            onPress={() =>
              void (hasPendingNewLeads
                ? processNewLeads()
                : runUnassignedLeads())
            }
            isDisabled={isActionDisabled}
          >
            <Play size={15} aria-hidden="true" />
            {isProcessingNewLeads
              ? "Đang xử lý…"
              : isWorkflowProcessing
                ? "Đang phân công…"
                : hasPendingNewLeads
                  ? `Xử lý Lead (${pendingNewCount})`
                  : "Phân công Lead"}
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
    </header>
  );
}
