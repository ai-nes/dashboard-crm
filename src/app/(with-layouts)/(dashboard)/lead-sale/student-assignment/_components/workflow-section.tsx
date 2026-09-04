"use client";

import dynamic from "next/dynamic";
import {
  ArrowDownward,
  ArrowRight,
  Close,
  InfoCircle,
  Play,
} from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { useAssignment } from "./assignment-context";
import { automationPath, workflowSteps } from "./data";
import { stepIcons, stepMetrics, toneClasses } from "./mappings";

const WorkflowCanvas = dynamic(() => import("./workflow-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[590px] items-center justify-center border-t border-card-border bg-background-gray-secondary text-sm text-text-tertiary">
      Đang tải sơ đồ phân công…
    </div>
  ),
});

export default function WorkflowSection() {
  const { records, selectStep, testRun, startTest, stopTest } = useAssignment();
  const path = testRun.status === "idle" ? [] : automationPath;
  const activeStepId =
    testRun.status === "running" ? path[testRun.stepIndex] : undefined;
  const activeStep = workflowSteps.find((step) => step.id === activeStepId);
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
            <Badge color="gray">Chỉ xem</Badge>
            <Button
              size="sm"
              appearance={testRun.status === "running" ? "outline" : "fill"}
              className={
                testRun.status === "running"
                  ? "border-card-border text-text-secondary"
                  : ""
              }
              onPress={testRun.status === "running" ? stopTest : startTest}
            >
              {testRun.status === "running" ? (
                <Close size={15} aria-hidden="true" />
              ) : (
                <Play size={15} aria-hidden="true" />
              )}
              {testRun.status === "running"
                ? "Dừng chạy thử"
                : testRun.status === "completed"
                  ? "Chạy lại luồng"
                  : "Chạy thử luồng"}
            </Button>
          </div>
        </div>
        {testRun.status !== "idle" && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-5 py-2.5 text-xs",
              testRun.status === "running"
                ? "bg-badge-primary-background text-badge-primary-text"
                : "bg-badge-success-background text-badge-success-text",
            )}
          >
            <span>
              {testRun.status === "running"
                ? `Đang chạy thử · ${activeStep?.title ?? "Chuẩn bị luồng"}`
                : "Đã chạy xong quy trình phân công tự động"}
            </span>
            <span className="tabular-nums">
              {testRun.status === "running"
                ? `${Math.max(0, testRun.stepIndex + 1)}/${path.length} bước`
                : `${automationPath.length}/${automationPath.length} bước`}
            </span>
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
              return (
                <li key={step.id}>
                  <Button
                    appearance="ghost"
                    onPress={() => selectStep(step.id)}
                    className={cn(
                      "h-auto w-full justify-start gap-3 border border-card-border px-3 py-3 text-left text-text-primary hover:bg-background-gray-secondary",
                      path.includes(step.id) &&
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
                        {stepMetrics(step.id, records)}
                      </span>
                    </span>
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
            <span>
              <span className="block text-sm font-semibold">
                Nhánh cần trưởng nhóm xử lý
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
            Sơ đồ mô tả quy trình chung; nút chạy thử chỉ mô phỏng trên giao
            diện.
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 border-t border-dashed border-badge-warning-text"
              aria-hidden="true"
            />
            Nhánh cần xử lý
          </span>
        </div>
      </Card>
    </section>
  );
}
