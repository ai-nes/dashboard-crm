"use client";

import { ArrowRight, ErrorCircle1 } from "@tailgrids/icons";
import { useMemo } from "react";

import {
  computeAnalysisKpis,
  getDeepAnalysisNotice,
} from "@/components/analysis-runs/analysis-run-meta";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { AnalysisRunSnapshot } from "@/services/api/analysis-runs";

import StudentAnalysisHighlights from "./student-analysis-highlights";

interface StudentNextActionProps {
  run: AnalysisRunSnapshot | null;
  isAwaitingAnalysisResponse: boolean;
  isAnalysisActive: boolean;
  analysisError: Error | null;
  onOpenAnalysisDetails: () => void;
}

export default function StudentNextAction({
  run,
  isAwaitingAnalysisResponse,
  isAnalysisActive,
  analysisError,
  onOpenAnalysisDetails,
}: StudentNextActionProps) {
  const student360Stage = useMemo(
    () =>
      run?.stages.find((stage) => stage.stageKind === "student_360") ?? null,
    [run],
  );
  const report = student360Stage?.report ?? null;
  const analysisNotice = run ? getDeepAnalysisNotice(run) : null;
  const kpis = useMemo(() => computeAnalysisKpis(run?.stages ?? []), [run]);
  const analysisDetailsLabel =
    kpis.totalClaims > 0
      ? `Xem ${kpis.totalClaims} tín hiệu phân tích`
      : "Xem báo cáo phân tích";

  const isAnalysisLoading = isAwaitingAnalysisResponse || isAnalysisActive;
  return (
    <section
      className="flex min-w-0 flex-col p-5 xl:p-6"
      aria-busy={isAnalysisLoading}
      aria-labelledby="student-analysis-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          id="student-analysis-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Chi tiết phân tích 360
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            appearance="ghost"
            className="text-primary-600 hover:text-primary-700"
            onPress={onOpenAnalysisDetails}
            size="xs"
          >
            {analysisDetailsLabel}
            <ArrowRight aria-hidden="true" size={14} />
          </Button>
          <Badge color="primary">Hôm nay</Badge>
        </div>
      </div>

      {isAnalysisLoading ? (
        <AnalysisTextSkeleton />
      ) : report ? (
        <StudentAnalysisHighlights report={report} />
      ) : (
        <div className="mt-6">
          <p className="text-sm leading-6 text-text-secondary">
            Chưa có báo cáo phân tích cho hồ sơ học sinh này.
          </p>
        </div>
      )}

      {analysisError && !isAnalysisActive && (
        <p
          className="mt-3 flex items-center gap-2 text-xs leading-5 text-error-600"
          role="alert"
        >
          <ErrorCircle1 size={15} aria-hidden="true" />
          Chưa thể hoàn tất phân tích. Bạn có thể thử lại.
        </p>
      )}

      {analysisNotice && !analysisError && (
        <p
          className="mt-3 text-xs leading-5 text-warning-700 dark:text-warning-300"
          role="status"
        >
          {analysisNotice}
        </p>
      )}
    </section>
  );
}

function AnalysisTextSkeleton() {
  return (
    <div className="mt-6 space-y-3" role="status" aria-live="polite">
      {["w-20", "w-16", "w-20"].map((labelWidth) => (
        <div
          className="space-y-2 rounded-lg border border-card-border p-3"
          key={labelWidth}
        >
          <Skeleton className={`h-3 ${labelWidth}`} />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}
