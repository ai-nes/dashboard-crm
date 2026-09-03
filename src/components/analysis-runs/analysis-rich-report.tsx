"use client";

import { InfoTriangle, Sparkle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  AnalysisReport,
  AnalysisReportItem,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import {
  formatClaimConfidence,
  getHighestConfidenceReportItem,
} from "./analysis-run-meta";

interface AnalysisRichReportProps {
  report: AnalysisReport;
}

/** Báo cáo ba khối: Tóm tắt · Rủi ro · Cơ hội. */
export default function AnalysisRichReport({ report }: AnalysisRichReportProps) {
  const highestRisk = getHighestConfidenceReportItem(report.risks);
  const highestOpportunity = getHighestConfidenceReportItem(
    report.recommendations.filter((item) => item.kind === "opportunity"),
  );
  const shortTitle =
    report.title ??
    highestRisk?.headline ??
    highestOpportunity?.headline ??
    "Tổng quan hồ sơ";

  return (
    <section aria-label="Báo cáo phân tích AI" className="space-y-4">
      <h2 className="text-xl leading-7 font-semibold tracking-tight text-text-primary">
        {shortTitle}
      </h2>

      <div className="rounded-xl border border-primary-200 bg-badge-primary-background p-4 dark:border-primary-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Sparkle size={16} className="text-primary-500" aria-hidden="true" />
          Tóm tắt
        </div>
        <p className="mt-2 text-sm leading-6 text-text-secondary text-pretty">
          {report.summary ?? "Chưa có tóm tắt cho lần phân tích này."}
        </p>
      </div>

      <ReportSection
        title="Rủi ro"
        tone="warning"
        item={highestRisk}
        emptyText="Chưa phát hiện rủi ro nổi bật trên dữ liệu hiện có."
      />
      <ReportSection
        title="Cơ hội"
        tone="success"
        item={highestOpportunity}
        emptyText="Chưa ghi nhận cơ hội nổi bật từ dữ liệu hiện có."
      />
    </section>
  );
}

function ReportSection({
  title,
  tone,
  item,
  emptyText,
}: {
  title: string;
  tone: "primary" | "warning" | "success";
  item: AnalysisReportItem | null;
  emptyText: string;
}) {
  const toneStyles = {
    primary:
      "border-primary-200 bg-primary-50/60 dark:border-primary-800 dark:bg-primary-950/20",
    warning:
      "border-warning-200 bg-warning-50/70 dark:border-warning-800 dark:bg-warning-950/20",
    success:
      "border-success-200 bg-badge-success-background dark:border-success-800",
  }[tone];

  return (
    <section className={cn("rounded-xl border p-4", toneStyles)} aria-label={title}>
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      </div>
      {item ? (
        <ul className="mt-3 space-y-2 border-t border-card-border pt-3">
          <ReportItemRow item={item} />
        </ul>
      ) : (
        <p className="mt-3 border-t border-card-border pt-3 text-sm leading-6 text-text-tertiary">
          {emptyText}
        </p>
      )}
    </section>
  );
}

const KIND_LABEL: Record<AnalysisReportItem["kind"], string> = {
  risk: "Rủi ro",
  recommendation: "Khuyến nghị",
  opportunity: "Cơ hội",
};

function ReportItemRow({ item }: { item: AnalysisReportItem }) {
  const confidence = formatClaimConfidence(item.confidence);
  const badgeColor = item.kind === "opportunity" ? "success" : item.kind === "risk" ? "warning" : "primary";
  return (
    <li className="rounded-lg border border-card-border bg-card-background p-3 text-sm leading-6 text-text-secondary">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Badge color={badgeColor} size="sm">
          {KIND_LABEL[item.kind]}
        </Badge>
        {confidence && (
          <Badge color={confidence.color} size="sm">
            {confidence.label}
          </Badge>
        )}
      </div>
      <p className="mt-2 font-semibold text-text-primary text-pretty">
        {item.headline}
      </p>
      {item.detail && item.detail !== item.headline && (
        <p className="mt-1.5 text-pretty">{item.detail}</p>
      )}
      {item.provenanceIds.length > 0 && (
        <p className="mt-2 flex items-center gap-1 text-xs text-text-tertiary">
          <InfoTriangle size={13} aria-hidden="true" />
          {item.provenanceIds.length} nguồn đối soát
        </p>
      )}
    </li>
  );
}
