"use client";

import { CheckCircle1, ErrorCircle1, InfoTriangle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import type { AnalysisRunStage } from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import {
  analysisStageState,
  stageLabels,
  statusMeta,
  type AnalysisStageDisplayState,
} from "./analysis-run-meta";

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
          const displayState = analysisStageState(stage.status);

          return (
            <div
              key={`${stage.id ?? stage.stageKind}-${stage.stageKind}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                displayState === "complete" && "border-success-500/25 bg-card-background text-text-primary shadow-2xs",
                displayState === "active" && "border-primary-500/30 bg-badge-primary-background text-primary-700 animate-pulse",
                displayState === "warning" && "border-warning-500/25 bg-badge-warning-background text-warning-700",
                displayState === "error" && "border-error-500/25 bg-badge-error-background text-error-700",
                displayState === "pending" && "border-card-border bg-card-background text-text-secondary",
              )}
            >
              <StageIcon status={displayState} />
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

function StageIcon({ status }: { status: AnalysisStageDisplayState }) {
  if (status === "complete") {
    return <CheckCircle1 size={14} className="shrink-0 text-success-500" aria-hidden="true" />;
  }

  if (status === "error") {
    return <ErrorCircle1 size={14} className="shrink-0 text-error-500" aria-hidden="true" />;
  }

  if (status === "warning") {
    return <InfoTriangle size={14} className="shrink-0 text-warning-500" aria-hidden="true" />;
  }

  if (status === "active") {
    return <RefreshCircle1Clockwise size={14} className="shrink-0 text-primary-500 motion-safe:animate-spin" aria-hidden="true" />;
  }

  return <span className="size-2 shrink-0 rounded-full bg-text-tertiary" aria-hidden="true" />;
}
