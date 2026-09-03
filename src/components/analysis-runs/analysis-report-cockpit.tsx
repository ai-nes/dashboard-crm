"use client";

import { ArrowRight } from "@tailgrids/icons";
import type { ReactNode } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type { AnalysisReport, AnalysisReportItem } from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import { getHighestConfidenceReportItem } from "./analysis-run-meta";

interface AnalysisReportCockpitProps {
  report: AnalysisReport;
  onOpenDetails: () => void;
  action?: ReactNode;
}

/**
 * Shared, data-first surface for Student 360 and School 360. Ba khối cố định:
 * Tóm tắt, Rủi ro và Cơ hội. Chi tiết đầy đủ nằm trong drawer.
 */
export default function AnalysisReportCockpit({
  report,
  onOpenDetails,
  action,
}: AnalysisReportCockpitProps) {
  const primaryRisk = getHighestConfidenceReportItem(report.risks);
  const primaryOpportunity = getHighestConfidenceReportItem(
    report.recommendations.filter((item) => item.kind === "opportunity"),
  );

  return (
    <section
      className="overflow-hidden rounded-xl border border-card-border bg-card-background"
      aria-label="Phân tích AI"
    >
      <div className="border-b border-card-border bg-background-soft-50 px-5 py-3">
        <p className="text-sm font-semibold text-text-primary">Phân tích AI</p>
      </div>
      <div className="min-w-0 divide-y divide-card-border">
        <SignalBlock
          label="Tóm tắt"
          tone="primary"
          heading={report.title ?? "Tổng quan tình trạng"}
          body={report.summary ?? "Chưa có tóm tắt cho lần phân tích này."}
        />
        <SignalBlock
          label="Rủi ro chính"
          tone="warning"
          heading={primaryRisk?.headline}
          body={primaryRisk?.detail}
          emptyText="Chưa phát hiện rủi ro nổi bật trên dữ liệu hiện có."
        />
        <SignalBlock
          label="Cơ hội"
          tone="success"
          heading={primaryOpportunity?.headline}
          body={primaryOpportunity?.detail}
          emptyText="Chưa ghi nhận cơ hội nổi bật từ dữ liệu hiện có."
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-card-border px-5 py-4">
        <Button
          appearance="ghost"
          size="xs"
          className="-ml-2 text-primary-700 hover:bg-primary-50 hover:text-primary-800 dark:text-primary-300 dark:hover:bg-primary-900/40"
          onPress={onOpenDetails}
        >
          Xem đầy đủ 3 phần
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
        {action}
      </div>
    </section>
  );
}

function SignalBlock({
  label,
  tone,
  heading,
  body,
  emptyText,
}: {
  label: string;
  tone: "primary" | "warning" | "success";
  heading?: string | null;
  body?: AnalysisReportItem["detail"] | null;
  emptyText?: string;
}) {
  const toneClass = {
    primary: "text-primary-700 dark:text-primary-300",
    warning: "text-warning-700 dark:text-warning-300",
    success: "text-success-600 dark:text-success-400",
  }[tone];

  return (
    <div className="min-w-0 px-5 py-4">
      <p className={cn("text-xs font-semibold", toneClass)}>{label}</p>
      {heading ? (
        <p className="mt-2 text-sm leading-6 font-semibold text-text-primary text-pretty">
          {heading}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-text-tertiary text-pretty">
          {emptyText}
        </p>
      )}
      {body && body !== heading && (
        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-text-secondary text-pretty">
          {body}
        </p>
      )}
    </div>
  );
}
