"use client";

import {
  CheckCircle1,
  ErrorCircle1,
  RefreshCircle1Clockwise,
} from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  AnalysisRunSnapshot,
  AnalysisRunStage,
  AnalysisRunStatus,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import { stageLabels } from "./analysis-run-meta";

interface AnalysisActivityFeedProps {
  run: AnalysisRunSnapshot;
  title: string;
}

type FeedState = "complete" | "active" | "pending" | "error";

export default function AnalysisActivityFeed({
  run,
  title,
}: AnalysisActivityFeedProps) {
  const activeStage = run.stages.find((stage) => stage.status === "running");
  const headline =
    run.status === "queued"
      ? "Đang chờ bắt đầu phân tích"
      : activeStage
        ? `Đang xử lý ${stageLabels[activeStage.stageKind]}`
        : "Đang tổng hợp kết quả";

  return (
    <div className="py-1" role="status" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-primary-500"
            aria-hidden="true"
          >
            <RefreshCircle1Clockwise
              className="motion-safe:animate-spin"
              size={16}
            />
          </div>
          <div className="min-w-0">
            <h3
              id={`${run.runKind}-analysis-heading`}
              className="text-sm font-semibold text-text-primary"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">{headline}</p>
          </div>
        </div>
        <Badge color="primary" className="shrink-0">
          <span
            className="size-1.5 rounded-full bg-primary-500 motion-safe:animate-pulse"
            aria-hidden="true"
          />
          Đang cập nhật
        </Badge>
      </div>

      <ol
        className="mt-5 space-y-3 border-t border-card-border pt-4"
        aria-label="Tiến trình phân tích"
      >
        {run.stages.map((stage) => (
          <ProcessingStage key={stage.id ?? stage.stageKind} stage={stage} />
        ))}
      </ol>

      <p className="mt-4 text-xs leading-5 text-text-tertiary">
        Kết quả sẽ hiển thị tại đây sau khi phân tích hoàn tất.
      </p>
    </div>
  );
}

function ProcessingStage({ stage }: { stage: AnalysisRunStage }) {
  const status = stageState(stage.status);
  const label = stageLabels[stage.stageKind];
  const detail =
    status === "complete"
      ? stage.claims.length > 0
        ? `${stage.claims.length} tín hiệu đã sẵn sàng`
        : "Đã hoàn tất"
      : status === "active"
        ? "Đang xử lý"
        : status === "error"
          ? "Cần kiểm tra lại"
          : "Chờ xử lý";

  return (
    <li className="flex min-w-0 items-center gap-3">
      <StageIcon status={status} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            status === "pending" ? "text-text-secondary" : "text-text-primary",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs text-text-tertiary">{detail}</p>
      </div>
      {status === "active" && (
        <Badge color="primary" size="sm">
          Đang xử lý
        </Badge>
      )}
    </li>
  );
}

function StageIcon({ status }: { status: FeedState }) {
  if (status === "complete") {
    return (
      <CheckCircle1
        size={18}
        className="shrink-0 text-success-500"
        aria-hidden="true"
      />
    );
  }

  if (status === "error") {
    return (
      <ErrorCircle1
        size={18}
        className="shrink-0 text-error-500"
        aria-hidden="true"
      />
    );
  }

  if (status === "active") {
    return (
      <RefreshCircle1Clockwise
        size={18}
        className="shrink-0 text-primary-500 motion-safe:animate-spin"
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="size-2 shrink-0 rounded-full bg-text-tertiary"
      aria-hidden="true"
    />
  );
}

function stageState(status: AnalysisRunStatus): FeedState {
  if (status === "completed") return "complete";
  if (status === "failed" || status === "dead_lettered") return "error";
  if (status === "running") return "active";
  return "pending";
}
