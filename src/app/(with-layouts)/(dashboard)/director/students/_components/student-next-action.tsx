"use client";

import {
  ArrowRight,
  ErrorCircle1,
  RefreshCircle1Clockwise,
} from "@tailgrids/icons";
import { useMemo } from "react";
import Link from "next/link";

import { getRichReport } from "@/components/analysis-runs/analysis-run-meta";
import AnalysisReportCockpit from "@/components/analysis-runs/analysis-report-cockpit";
import { Badge } from "@/components/tailgrids/core/badge";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { AnalysisRunSnapshot } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";

interface StudentNextActionProps {
  data: Student360Data;
  analysisTargetId?: string;
  run: AnalysisRunSnapshot | null;
  isAwaitingAnalysisResponse: boolean;
  isAnalysisActive: boolean;
  analysisError: Error | null;
  onOpenAnalysisDetails: () => void;
}

export default function StudentNextAction({
  data,
  analysisTargetId,
  run,
  isAwaitingAnalysisResponse,
  isAnalysisActive,
  analysisError,
  onOpenAnalysisDetails,
}: StudentNextActionProps) {
  const report = useMemo(() => getRichReport(run?.stages ?? []), [run]);
  return (
    <section
      className="flex min-w-0 flex-col p-5 xl:p-6"
      aria-busy={isAwaitingAnalysisResponse}
      aria-labelledby="next-action-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          id="next-action-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Phân tích AI
        </p>
        <Badge color={report ? "success" : "primary"}>
          {report ? "Đã phân tích" : "Chưa có báo cáo"}
        </Badge>
      </div>

      {isAwaitingAnalysisResponse ? (
        <ActionResultSkeleton />
      ) : isAnalysisActive ? (
        <div
          className="mt-7 flex items-center gap-2 text-sm text-text-secondary"
          role="status"
        >
          <RefreshCircle1Clockwise
            className="shrink-0 text-primary-500 motion-safe:animate-spin"
            size={16}
            aria-hidden="true"
          />
          <span>Đang tổng hợp tín hiệu hồ sơ…</span>
        </div>
      ) : report ? (
        <div className="mt-6">
          <AnalysisReportCockpit
            report={report}
            onOpenDetails={onOpenAnalysisDetails}
            action={
              <Link
                href={`/director/ai/next-best-action?studentId=${encodeURIComponent(analysisTargetId ?? data.student.code)}`}
                className="ml-1 inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-text-secondary hover:bg-background-soft-100 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Hành động
                <ArrowRight aria-hidden="true" size={14} />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-card-border bg-background-soft-50 p-4">
          <h3 className="text-base leading-6 font-semibold text-text-primary">
            Chưa có báo cáo phân tích
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Chạy phân tích để tổng hợp tín hiệu, rủi ro và khuyến nghị từ dữ liệu hồ sơ hiện có.
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
    </section>
  );
}


function ActionResultSkeleton() {
  return (
    <div className="mt-7 space-y-3" aria-label="Đang tải kết quả phân tích">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-8 w-4/5 max-w-lg" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-3/5 max-w-md" />
    </div>
  );
}
