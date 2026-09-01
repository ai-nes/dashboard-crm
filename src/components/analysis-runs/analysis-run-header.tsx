"use client";

import { ChevronDown, RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { CardTitle } from "@/components/tailgrids/core/card";
import type { AnalysisRunKind, AnalysisRunSnapshot } from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import { statusMeta } from "./analysis-run-meta";

interface AnalysisRunHeaderProps {
  kind: AnalysisRunKind;
  targetId: string;
  title: string;
  description?: string;
  run: AnalysisRunSnapshot | null;
  isActive: boolean;
  isPending: boolean;
  onRequest: () => void;
  embedded?: boolean;
}
export default function AnalysisRunHeader({
  kind,
  targetId,
  title,
  description,
  run,
  isActive,
  isPending,
  onRequest,
  embedded = false,
}: AnalysisRunHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);

  const requestLabel = isPending
    ? "Đang gửi yêu cầu"
    : isActive
      ? "Đang phân tích"
      : run
        ? "Phân tích lại"
        : "Chạy phân tích";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        !embedded && "border-b border-card-border px-5 py-4 lg:px-6",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
            aria-hidden="true"
          >
            <Sparkle size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle id={`${kind}-analysis-heading`} className="text-base font-bold text-text-primary">
                {title}
              </CardTitle>
              {run && (
                <Badge color={statusMeta[run.status].color} size="sm">
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-primary-500 motion-safe:animate-ping" aria-hidden="true" />
                  )}
                  {statusMeta[run.status].label}
                </Badge>
              )}
            </div>
            {description && (
              <p id={`${kind}-analysis-help`} className="mt-0.5 text-xs text-text-tertiary">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {run && (
            <Button
              appearance="ghost"
              size="xs"
              onPress={() => setShowDetails((prev) => !prev)}
              className="text-text-tertiary hover:text-text-primary"
              aria-expanded={showDetails}
            >
              <span>Chi tiết phiên</span>
              <ChevronDown
                size={14}
                className={cn("transition-transform duration-200", showDetails && "rotate-180")}
                aria-hidden="true"
              />
            </Button>
          )}

          <Button
            appearance={run && !isActive ? "outline" : undefined}
            size="sm"
            onPress={onRequest}
            isDisabled={!targetId.trim() || isPending || Boolean(isActive)}
            aria-describedby={`${kind}-analysis-help`}
          >
            <RefreshCircle1Clockwise
              size={15}
              className={cn(isActive && "motion-safe:animate-spin")}
              aria-hidden="true"
            />
            {requestLabel}
          </Button>
        </div>
      </div>

      {run && showDetails && (
        <div className="rounded-xl border border-card-border bg-background-soft-50 p-3 text-xs text-text-secondary animate-in fade-in slide-in-from-top-1">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-text-tertiary">Mã phiên (Run ID):</span>{" "}
              <span className="font-mono font-medium text-text-primary">{run.runId}</span>
            </div>
            {run.receiptId && (
              <div>
                <span className="text-text-tertiary">Receipt ID:</span>{" "}
                <span className="font-mono font-medium text-text-primary">{run.receiptId}</span>
              </div>
            )}
            {run.sourceRevision !== null && run.sourceRevision !== undefined && (
              <div>
                <span className="text-text-tertiary">Bản sửa đổi dữ liệu:</span>{" "}
                <span className="font-semibold text-text-primary">v{run.sourceRevision}</span>
              </div>
            )}
            {run.reusedExistingRun && (
              <div>
                <span className="text-text-tertiary">Bộ nhớ đệm:</span>{" "}
                <span className="text-success-600">Tái sử dụng phiên gần nhất</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
