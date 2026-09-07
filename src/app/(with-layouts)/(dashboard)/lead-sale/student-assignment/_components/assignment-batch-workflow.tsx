"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ArrowDownward, ArrowRight, Check, InfoCircle } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import {
  getBatchWorkflowCurrentPhaseId,
  getBatchWorkflowPhaseState,
  getBatchWorkflowStepMetric,
  getBatchWorkflowSteps,
} from "../../_shared/lead-assignment-batch/batch-assignment-workflow-data";
import { useBatchAssignment } from "../../_shared/lead-assignment-batch/batch-assignment-context";
import {
  batchStatusColors,
  batchStatusLabels,
  formatCount,
} from "../../_shared/lead-assignment-batch/batch-assignment-mappings";
import {
  stepIcons,
  toneClasses,
  workflowPhaseStateColors,
  workflowPhaseStateLabels,
} from "../../_shared/student-assignment/mappings";
import type { StepId } from "../../_shared/student-assignment/types";
import DetailDrawer from "../../_shared/student-assignment/detail-drawer";

const AssignmentBatchWorkflowCanvas = dynamic(
  () => import("./assignment-batch-workflow-canvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[560px] items-center justify-center border-t border-card-border bg-background-gray-secondary text-sm text-text-tertiary">
        Đang tải sơ đồ phân công…
      </div>
    ),
  },
);

export default function AssignmentBatchWorkflow() {
  const { activeBatch } = useBatchAssignment();
  const [selectedStep, setSelectedStep] = useState<StepId | null>(null);
  const steps = useMemo(
    () => getBatchWorkflowSteps(activeBatch),
    [activeBatch],
  );
  const currentPhaseId = getBatchWorkflowCurrentPhaseId(steps);
  const currentPhase = steps.find((step) => step.id === currentPhaseId);
  const selectedWorkflowStep = steps.find((step) => step.id === selectedStep);
  const currentPhaseState = currentPhase
    ? getBatchWorkflowPhaseState(currentPhase, currentPhaseId)
    : null;
  const isRunning = activeBatch?.status === "running";

  const phaseBadgeLabel = !activeBatch
    ? "Chưa có lần chạy"
    : isRunning
      ? "Đang phân công"
      : currentPhase && currentPhaseState
        ? `${workflowPhaseStateLabels[currentPhaseState]} · ${currentPhase.title}`
        : batchStatusLabels[activeBatch.status];

  return (
    <>
      <section
        id="assignment-workflow"
        aria-labelledby="workflow-heading"
        className="scroll-mt-24"
      >
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2
                id="workflow-heading"
                tabIndex={-1}
                className="text-base font-semibold text-text-primary outline-none"
              >
                Quy trình phân công tự động
              </h2>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                Chọn một bước để xem điều kiện và kết quả xử lý.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge
                color={
                  activeBatch && currentPhaseState
                    ? workflowPhaseStateColors[currentPhaseState]
                    : "gray"
                }
                className="max-w-[280px] truncate"
                title={phaseBadgeLabel}
              >
                {phaseBadgeLabel}
              </Badge>
              <Badge
                color={
                  activeBatch ? batchStatusColors[activeBatch.status] : "gray"
                }
              >
                {activeBatch
                  ? batchStatusLabels[activeBatch.status]
                  : "Chưa có dữ liệu"}
              </Badge>
            </div>
          </div>

          {activeBatch && (
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-5 py-2.5 text-xs",
                isRunning
                  ? "bg-badge-primary-background text-badge-primary-text"
                  : activeBatch.status === "completed_with_errors"
                    ? "bg-badge-warning-background text-badge-warning-text"
                    : activeBatch.status === "completed"
                      ? "bg-badge-success-background text-badge-success-text"
                      : "bg-background-gray-secondary text-text-tertiary",
              )}
            >
              <span>
                {isRunning
                  ? "Hệ thống đang xử lý phân công. Kết quả sẽ cập nhật sau khi hoàn tất."
                  : "Sơ đồ hiển thị theo trạng thái xử lý và kết quả từng Lead."}
              </span>
              <span className="tabular-nums">
                {formatCount(activeBatch.summary.assigned)} đã giao ·{" "}
                {formatCount(
                  activeBatch.summary.deferred +
                    activeBatch.summary.manualReview +
                    activeBatch.summary.failed,
                )}{" "}
                cần xử lý tiếp
              </span>
            </div>
          )}

          <div className="hidden xl:block">
            <AssignmentBatchWorkflowCanvas
              steps={steps}
              currentPhaseId={currentPhaseId}
              selectedStep={selectedStep}
              hasBatch={Boolean(activeBatch)}
              onSelect={setSelectedStep}
            />
          </div>
          <ol className="space-y-2 border-t border-card-border p-4 xl:hidden">
            {steps
              .filter((step) => step.id !== "review")
              .map((step, index, visibleSteps) => {
                const Icon = stepIcons[step.id];
                const phaseState = getBatchWorkflowPhaseState(
                  step,
                  currentPhaseId,
                );
                return (
                  <li key={step.id}>
                    <Button
                      appearance="ghost"
                      onPress={() => setSelectedStep(step.id)}
                      className={cn(
                        "h-auto w-full justify-start gap-3 border border-card-border px-3 py-3 text-left text-text-primary hover:bg-background-gray-secondary",
                        step.status === "running" &&
                          "border-primary-400 bg-badge-primary-background",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          toneClasses[step.tone],
                        )}
                      >
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {step.title}
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-text-tertiary">
                          {getBatchWorkflowStepMetric(step)}
                        </span>
                      </span>
                      <Badge
                        color={workflowPhaseStateColors[phaseState]}
                        className="shrink-0 text-[10px]"
                      >
                        {workflowPhaseStateLabels[phaseState]}
                      </Badge>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Button>
                    {index < visibleSteps.length - 1 && (
                      <div className="my-2 flex items-center gap-2 pl-6 text-xs text-text-tertiary">
                        {step.id === "matching" ? (
                          "Đã tìm Team theo tỉnh"
                        ) : (
                          <ArrowDownward size={14} aria-hidden="true" />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
          </ol>
          <div className="px-4 pb-4 xl:hidden">
            <Button
              appearance="ghost"
              className="h-auto w-full justify-start whitespace-normal border border-card-border bg-badge-warning-background p-3 text-left text-badge-warning-text"
              onPress={() => setSelectedStep("review")}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    Hồ sơ cần xử lý tiếp
                  </span>
                  <Badge
                    color={
                      workflowPhaseStateColors[
                        getBatchWorkflowPhaseState(
                          steps.find((step) => step.id === "review")!,
                          currentPhaseId,
                        )
                      ]
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {
                      workflowPhaseStateLabels[
                        getBatchWorkflowPhaseState(
                          steps.find((step) => step.id === "review")!,
                          currentPhaseId,
                        )
                      ]
                    }
                  </Badge>
                </span>
                <span className="mt-1 block text-xs font-normal">
                  Cần kiểm tra, tạm hoãn hoặc lỗi xử lý. Mở hồ sơ để xem nguyên
                  nhân.
                </span>
              </span>
              <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-5 py-3 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <InfoCircle size={14} aria-hidden="true" />
              Sơ đồ chỉ phản ánh kết quả do hệ thống phân công trả về.
            </span>
            <span className="flex flex-wrap items-center gap-1.5">
              <span>Phase:</span>
              <Badge color="primary" className="text-[10px]">
                Phase hiện tại
              </Badge>
              <Badge color="success" className="text-[10px]">
                Đã hoàn tất
              </Badge>
              <Badge color="warning" className="text-[10px]">
                Cần xử lý
              </Badge>
              <Badge color="gray" className="text-[10px]">
                Chưa tới
              </Badge>
            </span>
          </div>
        </Card>
      </section>

      {selectedWorkflowStep && (
        <DetailDrawer
          title={selectedWorkflowStep.title}
          subtitle="CHI TIẾT QUY TRÌNH PHÂN CÔNG"
          onClose={() => setSelectedStep(null)}
        >
          <p className="text-sm leading-6 text-text-secondary">
            {selectedWorkflowStep.detail}
          </p>
          <div className="my-6 rounded-xl border border-card-border bg-background-gray-secondary p-4">
            <p className="text-xs text-text-tertiary">
              {activeBatch ? "Trong lần chạy đang xem" : "Chưa có lần chạy"}
            </p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {getBatchWorkflowStepMetric(selectedWorkflowStep)}
            </p>
          </div>
          <h3 className="text-sm font-semibold text-text-primary">
            Cách xử lý
          </h3>
          <ul className="mt-3 space-y-3">
            {selectedWorkflowStep.rules.map((rule) => (
              <li
                key={rule}
                className="flex gap-2.5 text-sm leading-6 text-text-secondary"
              >
                <Check
                  size={16}
                  className="mt-1 shrink-0 text-badge-success-text"
                  aria-hidden="true"
                />
                {rule}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-2 rounded-lg bg-badge-sky-background p-3 text-xs leading-5 text-badge-sky-text">
            <InfoCircle
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            Thông tin chi tiết của từng hồ sơ được lấy từ hệ thống phân công.
          </p>
        </DetailDrawer>
      )}
    </>
  );
}
