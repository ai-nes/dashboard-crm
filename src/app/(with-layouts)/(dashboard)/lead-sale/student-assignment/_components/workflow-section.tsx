"use client";

import dynamic from "next/dynamic";
import {
  ArrowDownward,
  ArrowRight,
  InfoCircle,
  Play,
  RefreshCircle1Clockwise,
} from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { useAssignment } from "../../_shared/student-assignment/assignment-context";
import {
  getWorkflowPhaseState,
  stepIcons,
  stepMetrics,
  toneClasses,
  workflowPhaseStateColors,
  workflowPhaseStateLabels,
} from "../../_shared/student-assignment/mappings";

const WorkflowCanvas = dynamic(() => import("./workflow-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center border-t border-card-border bg-background-gray-secondary text-sm text-text-tertiary">
      Đang tải sơ đồ phân công…
    </div>
  ),
});

export default function WorkflowSection() {
  const {
    workflowSteps,
    selectStep,
    workflowMode,
    currentPhaseId,
    pipelineRun,
    isRunningPipeline,
    runPipeline,
    meta,
  } = useAssignment();
  const canRunPipeline = workflowMode === "live" && Boolean(meta);
  const currentPhase = workflowSteps.find(
    (step) => step.id === currentPhaseId,
  );
  const currentPhaseState = currentPhase
    ? getWorkflowPhaseState(currentPhase, currentPhaseId)
    : null;
  const reviewStep = workflowSteps.find((step) => step.id === "review");
  const reviewPhaseState = reviewStep
    ? getWorkflowPhaseState(reviewStep, currentPhaseId)
    : "pending";
  const phaseBadgeColor = isRunningPipeline
    ? "primary"
    : currentPhaseState
      ? workflowPhaseStateColors[currentPhaseState]
      : pipelineRun
        ? "success"
        : "gray";
  const phaseBadgeLabel = isRunningPipeline
    ? "Đang chạy pipeline"
    : currentPhase && currentPhaseState
      ? `${workflowPhaseStateLabels[currentPhaseState]} · ${currentPhase.title}`
      : pipelineRun
        ? "Pipeline đã hoàn tất"
        : "Chưa có trạng thái phase";
  return (
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
              Chọn một bước để xem cách xử lý và điều kiện phân công.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge
              color={phaseBadgeColor}
              className="max-w-[280px] truncate"
              title={phaseBadgeLabel}
            >
              {phaseBadgeLabel}
            </Badge>
            <Badge color={canRunPipeline ? "success" : "gray"}>
              {canRunPipeline ? "Có thể chạy" : "Chỉ xem"}
            </Badge>
            <Button
              size="sm"
              appearance={isRunningPipeline ? "outline" : "fill"}
              className={
                isRunningPipeline
                  ? "border-card-border text-text-secondary"
                  : ""
              }
              onPress={() => void runPipeline()}
              isDisabled={!canRunPipeline || isRunningPipeline}
            >
              {isRunningPipeline ? (
                <RefreshCircle1Clockwise
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Play size={15} aria-hidden="true" />
              )}
              {isRunningPipeline
                ? "Đang chạy pipeline…"
                : pipelineRun
                  ? "Chạy lại pipeline"
                  : "Chạy pipeline"}
            </Button>
          </div>
        </div>
        {(isRunningPipeline || pipelineRun) && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-5 py-2.5 text-xs",
              isRunningPipeline
                ? "bg-badge-primary-background text-badge-primary-text"
                : pipelineRun?.status === "completed_with_errors"
                  ? "bg-badge-warning-background text-badge-warning-text"
                  : "bg-badge-success-background text-badge-success-text",
            )}
          >
            <span>
              {isRunningPipeline
                ? "Đang chạy pipeline phân công trên máy chủ…"
                : "Pipeline phân công đã cập nhật workspace"}
            </span>
            {pipelineRun && !isRunningPipeline && (
              <span className="tabular-nums">
                {pipelineRun.assigned} gán · {pipelineRun.deferred} chờ ·{" "}
                {pipelineRun.failed} lỗi
              </span>
            )}
          </div>
        )}
        <div className="hidden xl:block">
          <WorkflowCanvas />
        </div>
        <ol className="space-y-2 border-t border-card-border p-4 xl:hidden">
          {workflowSteps
            .filter((step) => step.id !== "review")
            .map((step, index, steps) => {
              const Icon = stepIcons[step.id];
              const phaseState = getWorkflowPhaseState(step, currentPhaseId);
              return (
                <li key={step.id}>
                  <Button
                    appearance="ghost"
                    onPress={() => selectStep(step.id)}
                    className={cn(
                      "h-auto w-full justify-start gap-3 border border-card-border px-3 py-3 text-left text-text-primary hover:bg-background-gray-secondary",
                      isRunningPipeline &&
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
                        {stepMetrics(step)}
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
                  {index < steps.length - 1 && (
                    <div className="my-2 flex items-center gap-2 pl-6 text-xs text-text-tertiary">
                      {step.id === "matching" ? (
                        "Có người phù hợp"
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
            onPress={() => selectStep("review")}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  Nhánh cần trưởng nhóm xử lý
                </span>
                <Badge
                  color={workflowPhaseStateColors[reviewPhaseState]}
                  className="shrink-0 text-[10px]"
                >
                  {workflowPhaseStateLabels[reviewPhaseState]}
                </Badge>
              </span>
              <span className="mt-1 block text-xs font-normal">
                Thiếu thông tin hoặc chưa có người phù hợp → Xem xét → Phân
                công.
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-5 py-3 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <InfoCircle size={14} aria-hidden="true" />
            {canRunPipeline
              ? "Sơ đồ lấy trạng thái từ backend; nút chạy sẽ xử lý dữ liệu thực tế."
              : "Sơ đồ đang ở chế độ chỉ xem; backend chưa cho phép chạy pipeline."}
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 border-t border-dashed border-badge-warning-text"
              aria-hidden="true"
            />
            Nhánh cần xử lý
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
  );
}
