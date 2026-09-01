"use client";

import { CheckCircle1, ErrorCircle1, InfoTriangle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import type { AnalysisRunStage } from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import { stageLabels, statusMeta } from "./analysis-run-meta";

interface AnalysisStageRailProps {
  stages: AnalysisRunStage[];
}

export default function AnalysisStageRail({ stages }: AnalysisStageRailProps) {
  if (!stages.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-card-border bg-background-soft-50 p-2.5" role="region" aria-label="Tiến trình phân tích">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        Giai đoạn:
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {stages.map((stage) => {
          const meta = statusMeta[stage.status];
          const isComplete = stage.status === "completed";
          const isRunning = stage.status === "running";
          const isFailed = stage.status === "failed" || stage.status === "dead_lettered";

          return (
            <div
              key={`${stage.id ?? stage.stageKind}-${stage.stageKind}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
                isComplete && "border-success-500/25 bg-card-background text-text-primary shadow-2xs",
                isRunning && "border-primary-500/30 bg-badge-primary-background text-primary-700 animate-pulse",
                isFailed && "border-error-500/25 bg-badge-error-background text-error-700",
                !isComplete && !isRunning && !isFailed && "border-card-border bg-card-background text-text-secondary",
              )}
            >
              <StageIcon status={stage.status} />
              <span className="font-semibold">{stageLabels[stage.stageKind]}</span>
              <span className="rounded-md bg-background-soft-50 px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                {stage.claims.length > 0 ? `${stage.claims.length} tín hiệu` : meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageIcon({ status }: { status: AnalysisRunStage["status"] }) {
  if (status === "completed") {
    return <CheckCircle1 size={14} className="shrink-0 text-success-500" aria-hidden="true" />;
  }

  if (status === "failed" || status === "dead_lettered") {
    return <ErrorCircle1 size={14} className="shrink-0 text-error-500" aria-hidden="true" />;
  }

  if (status === "abstained") {
    return <InfoTriangle size={14} className="shrink-0 text-warning-500" aria-hidden="true" />;
  }

  return <RefreshCircle1Clockwise size={14} className="shrink-0 text-primary-500 motion-safe:animate-spin" aria-hidden="true" />;
}
