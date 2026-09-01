"use client";

import { CheckCircle1, InfoTriangle, Shield1Check, Sparkle } from "@tailgrids/icons";

import type { AnalysisRunStage } from "@/services/api/analysis-runs";
import { computeAnalysisKpis } from "./analysis-run-meta";

interface AnalysisKpiSummaryProps {
  stages: AnalysisRunStage[];
}
export default function AnalysisKpiSummary({ stages }: AnalysisKpiSummaryProps) {
  const kpis = computeAnalysisKpis(stages);

  if (kpis.totalClaims === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* KPI 1: Đề xuất hành động */}
      <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card-background p-3 shadow-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
          <Sparkle size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-tertiary">Đề xuất hành động</p>
          <p className="text-base font-bold text-text-primary">
            {kpis.recommendationsCount}{" "}
            <span className="text-xs font-normal text-text-secondary">hành động</span>
          </p>
        </div>
      </div>

      {/* KPI 2: Tổng tín hiệu */}
      <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card-background p-3 shadow-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
          <CheckCircle1 size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-tertiary">Tín hiệu phân tích</p>
          <p className="text-base font-bold text-text-primary">
            {kpis.totalClaims}{" "}
            <span className="text-xs font-normal text-text-secondary">tín hiệu</span>
          </p>
        </div>
      </div>

      {/* KPI 3: Nguồn kiểm chứng */}
      <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card-background p-3 shadow-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-500/10 text-success-600 dark:bg-success-500/20 dark:text-success-400">
          <Shield1Check size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-tertiary">Nguồn đối soát</p>
          <p className="text-base font-bold text-text-primary">
            {kpis.sourcedPercent}%{" "}
            <span className="text-xs font-normal text-text-secondary">
              ({kpis.sourcedCount}/{kpis.totalClaims})
            </span>
          </p>
        </div>
      </div>

      {/* KPI 4: Điểm tin cậy / Lưu ý */}
      <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card-background p-3 shadow-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-500/10 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400">
          {kpis.uncertaintiesCount > 0 ? (
            <InfoTriangle size={16} aria-hidden="true" />
          ) : (
            <Sparkle size={16} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-tertiary">
            {kpis.uncertaintiesCount > 0 ? "Điểm cần lưu ý" : "Độ tin cậy TB"}
          </p>
          <p className="text-base font-bold text-text-primary">
            {kpis.uncertaintiesCount > 0 ? (
              <>
                {kpis.uncertaintiesCount}{" "}
                <span className="text-xs font-normal text-warning-600">điểm rủi ro</span>
              </>
            ) : kpis.avgConfidence !== null ? (
              `${kpis.avgConfidence}%`
            ) : (
              "Cao"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
