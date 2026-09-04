"use client";

import { InfoTriangle, Sparkle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  AnalysisAdvisorySignal,
  AnalysisReport,
  AnalysisReportItem,
  AnalysisRecentChange,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import { formatAnalysisLevel, formatClaimConfidence } from "./analysis-run-meta";

interface AnalysisRichReportProps {
  report: AnalysisReport;
  stageLabel?: string;
}

/** Báo cáo đầy đủ: hiển thị toàn bộ item mà API trả về. */
export default function AnalysisRichReport({
  report,
  stageLabel,
}: AnalysisRichReportProps) {
  const advisorySignals = report.advisorySignals ?? [];
  const recommendations = report.recommendations.filter(
    (item) => item.kind === "recommendation",
  );
  const opportunities =
    report.opportunities ??
    report.recommendations.filter((item) => item.kind === "opportunity");
  const shortTitle =
    report.title ??
    advisorySignals[0]?.title ??
    report.risks[0]?.headline ??
    report.recommendations[0]?.headline ??
    "Tổng quan hồ sơ";
  const summary = report.summary ?? advisorySignals[0]?.summary ?? null;

  return (
    <section aria-label="Báo cáo phân tích AI" className="space-y-4">
      <div>
        {stageLabel && (
          <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
            {stageLabel}
          </p>
        )}
        <h2 className="mt-1 text-xl leading-7 font-semibold tracking-tight text-text-primary">
          {shortTitle}
        </h2>
      </div>

      <div className="rounded-xl border border-primary-200 bg-badge-primary-background p-4 dark:border-primary-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Sparkle size={16} className="text-primary-500" aria-hidden="true" />
          Tóm tắt
        </div>
        <p className="mt-2 text-sm leading-6 text-text-secondary text-pretty">
          {summary ?? "Chưa có tóm tắt cho lần phân tích này."}
        </p>
      </div>

      <AdvisorySection items={advisorySignals} />
      <ReportSection
        title="Rủi ro"
        tone="warning"
        items={report.risks}
        emptyText="Chưa phát hiện rủi ro nổi bật trên dữ liệu hiện có."
      />
      <ReportSection
        title="Khuyến nghị"
        tone="primary"
        items={recommendations}
        emptyText="Chưa có khuyến nghị cho lần phân tích này."
      />
      <ReportSection
        title="Cơ hội"
        tone="success"
        items={opportunities}
        emptyText="Chưa ghi nhận cơ hội nổi bật từ dữ liệu hiện có."
      />
      {report.missingEvidence && report.missingEvidence.length > 0 && (
        <MissingEvidenceSection items={report.missingEvidence} />
      )}
      <RecentChangesSection items={report.recentChanges ?? []} />
    </section>
  );
}

function AdvisorySection({ items }: { items: AnalysisAdvisorySignal[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-primary-200 bg-primary-50/40 p-4 dark:border-primary-800 dark:bg-primary-950/20"
      aria-label="Tín hiệu tư vấn"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">
          Tín hiệu tư vấn
        </h3>
        <Badge color="primary" size="sm">
          {items.length}
        </Badge>
      </div>
      <ul className="mt-3 space-y-3 border-t border-card-border pt-3">
        {items.map((item, index) => {
          const confidence = formatClaimConfidence(item.confidence);
          return (
            <li
              key={`${item.type}-${item.title}-${index}`}
              className="rounded-lg border border-card-border bg-card-background p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {item.type}
                  </p>
                  <p className="mt-1 font-semibold text-text-primary text-pretty">
                    {item.title}
                  </p>
                </div>
                {confidence && (
                  <Badge color={confidence.color} size="sm">
                    {confidence.label}
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-6 text-text-secondary text-pretty">
                {item.summary}
              </p>
              <EvidenceCount count={item.evidenceRefs.length} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ReportSection({
  title,
  tone,
  items,
  emptyText,
}: {
  title: string;
  tone: "primary" | "warning" | "success";
  items: AnalysisReportItem[];
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
  const badgeColor = {
    primary: "primary",
    warning: "warning",
    success: "success",
  }[tone] as "primary" | "warning" | "success";

  return (
    <section className={cn("rounded-xl border p-4", toneStyles)} aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <Badge color={badgeColor} size="sm">
          {items.length}
        </Badge>
      </div>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-card-border pt-3">
          {items.map((item, index) => (
            <ReportItemRow
              key={`${title}-${index}-${item.headline.slice(0, 32)}`}
              item={item}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-3 border-t border-card-border pt-3 text-sm leading-6 text-text-tertiary">
          {emptyText}
        </p>
      )}
    </section>
  );
}

function MissingEvidenceSection({ items }: { items: string[] }) {
  return (
    <section
      className="rounded-xl border border-warning-200 bg-background-soft-50 p-4 dark:border-warning-800"
      aria-label="Dữ liệu còn thiếu"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">
          Dữ liệu còn thiếu
        </h3>
        <Badge color="warning" size="sm">
          {items.length}
        </Badge>
      </div>
      <ul className="mt-3 list-disc space-y-1 border-t border-card-border pt-3 pl-5 text-sm leading-6 text-text-secondary">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function RecentChangesSection({ items }: { items: AnalysisRecentChange[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-card-border bg-background-soft-50 p-4"
      aria-label="Thay đổi gần đây"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">
          Thay đổi gần đây
        </h3>
        <Badge color="gray" size="sm">
          {items.length}
        </Badge>
      </div>
      <ul className="mt-3 space-y-2 border-t border-card-border pt-3">
        {items.map((item, index) => (
          <li
            key={`${item.type}-${index}`}
            className="rounded-lg border border-card-border bg-card-background p-3"
          >
            <p className="text-xs font-medium text-text-tertiary">{item.type}</p>
            <p className="mt-1 text-sm leading-6 text-text-primary text-pretty">
              {item.summary}
            </p>
            <EvidenceCount count={item.evidenceRefs.length} />
          </li>
        ))}
      </ul>
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
      {item.severity && (
        <Badge color="warning" size="sm" className="mt-2">
          Mức độ: {formatAnalysisLevel(item.severity)}
        </Badge>
      )}
      {item.strength && (
        <Badge color="success" size="sm" className="mt-2">
          Mức độ: {formatAnalysisLevel(item.strength)}
        </Badge>
      )}
      <EvidenceCount count={item.provenanceIds.length} />
    </li>
  );
}

function EvidenceCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-text-tertiary">
      <InfoTriangle size={13} aria-hidden="true" />
      {count} nguồn đối soát
    </p>
  );
}
