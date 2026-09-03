"use client";

import {
  formatClaimConfidence,
  getHighestConfidenceReportItem,
} from "@/components/analysis-runs/analysis-run-meta";
import { Badge } from "@/components/tailgrids/core/badge";
import type {
  AnalysisReport,
  AnalysisReportItem,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

interface StudentAnalysisHighlightsProps {
  report: AnalysisReport;
}

export default function StudentAnalysisHighlights({
  report,
}: StudentAnalysisHighlightsProps) {
  const highestRisk = getHighestConfidenceReportItem(report.risks);
  const highestOpportunity = getHighestConfidenceReportItem(
    report.recommendations.filter((item) => item.kind === "opportunity"),
  );

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <AnalysisHighlight
          label="Tóm tắt"
          tone="primary"
          detail={report.summary ?? report.title ?? "Tổng quan hồ sơ học sinh"}
          emptyText="Chưa có tóm tắt cho lần phân tích này."
        />
      </div>
      <AnalysisHighlight
        label="Rủi ro"
        tone="warning"
        item={highestRisk}
        emptyText="Chưa phát hiện rủi ro nổi bật trên dữ liệu hiện có."
      />
      <AnalysisHighlight
        label="Cơ hội"
        tone="success"
        item={highestOpportunity}
        emptyText="Chưa ghi nhận cơ hội nổi bật từ dữ liệu hiện có."
      />
    </div>
  );
}

function AnalysisHighlight({
  label,
  tone,
  item,
  detail,
  emptyText,
}: {
  label: string;
  tone: "primary" | "warning" | "success";
  item?: AnalysisReportItem | null;
  detail?: string | null;
  emptyText: string;
}) {
  const toneDotStyles = {
    primary: "bg-primary-500",
    warning: "bg-warning-500",
    success: "bg-success-500",
  }[tone];
  const labelStyles = {
    primary: "text-primary-700 dark:text-primary-300",
    warning: "text-warning-700 dark:text-warning-300",
    success: "text-success-700 dark:text-success-300",
  }[tone];
  const confidence = item ? formatClaimConfidence(item.confidence) : null;
  const content = item?.headline ?? detail;

  return (
    <section
      className="min-w-0 rounded-lg border border-card-border bg-background-soft-50 p-4"
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-full", toneDotStyles)}
          />
          <p className={cn("text-xs font-semibold", labelStyles)}>{label}</p>
        </div>
        {confidence && (
          <Badge color={confidence.color} size="sm">
            {confidence.label}
          </Badge>
        )}
      </div>
      {content ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 font-semibold text-text-primary text-pretty">
          {content}
        </p>
      ) : (
        <p className="mt-1.5 text-pretty text-sm leading-5 text-text-secondary">
          {emptyText}
        </p>
      )}
    </section>
  );
}
