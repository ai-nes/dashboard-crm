"use client";

import { InfoCircle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useInteractionNpsPointQuery } from "@/hooks/use-interaction-intelligence-queries";

interface StudentCallQualityScoreProps {
  interactionId: string;
}

const DIMENSIONS = [
  ["Satisfaction", "satisfaction_score"],
  ["Resolution", "resolution_score"],
  ["Low Friction", "friction_score"],
  ["No Complaint", "complaint_score"],
] as const;

export default function StudentCallQualityScore({ interactionId }: StudentCallQualityScoreProps) {
  const query = useInteractionNpsPointQuery(interactionId);
  const point = query.data?.point;

  return (
    <section
      aria-labelledby={`call-quality-${interactionId}`}
      className="rounded-lg border border-card-border bg-card-background p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id={`call-quality-${interactionId}`} className="text-sm font-semibold text-text-primary">
            Chất lượng cuộc gọi · NPS Point
          </h3>
          <p className="mt-1 text-xs text-text-tertiary">
            Thang điểm 1–10, chỉ tính khi có đủ evidence của học sinh.
          </p>
        </div>
        {point ? (
          <Badge color={point.status === "scored" ? "success" : "warning"} size="sm">
            {point.status === "scored"
              ? "Đã chấm"
              : point.status === "abstained"
                ? "Tạm dừng chấm"
                : "Đã được thay thế"}
          </Badge>
        ) : null}
      </div>

      {point ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-tertiary">
          <span>Sale: {point.sale || "Chưa xác định"}</span>
          <span>Độ tin cậy: {point.confidence || "—"}</span>
          {point.interaction_datetime ? (
            <time dateTime={point.interaction_datetime}>Cuộc gọi: {point.interaction_datetime}</time>
          ) : null}
        </div>
      ) : null}

      {query.isPending ? <ScoreSkeleton /> : null}

      {query.isError ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-badge-error-background p-3 text-sm text-error-600" role="alert">
          <InfoCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Không thể tải điểm chất lượng cuộc gọi. {query.error.message}</span>
        </div>
      ) : null}

      {!query.isPending && !query.isError && !point ? (
        <p className="mt-3 text-sm text-text-secondary">Cuộc gọi này chưa có NPS Point.</p>
      ) : null}

      {point?.status === "abstained" ? (
        <div className="mt-3 rounded-lg bg-badge-warning-background p-3 text-sm leading-5 text-badge-warning-text">
          Chưa đủ dữ liệu để chấm điểm an toàn: {point.terminal_reason || "assessment_insufficient_evidence"}.
        </div>
      ) : null}

      {point?.status === "superseded" ? (
        <div className="mt-3 rounded-lg bg-background-gray-secondary/60 p-3 text-sm leading-5 text-text-secondary">
          Điểm này đã được thay thế bởi bản hiệu chỉnh mới
          {point.superseded_by ? ` (${point.superseded_by})` : ""}.
        </div>
      ) : null}

      {point?.status === "scored" ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DIMENSIONS.map(([label, field]) => (
              <div key={field} className="rounded-lg border border-card-border/70 bg-background-gray-secondary/40 p-3">
                <p className="text-xs text-text-tertiary">{label}</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">
                  {point[field] ?? "—"}
                  <span className="text-xs font-normal text-text-tertiary">/10</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-card-border pt-3">
            <span className="text-sm text-text-secondary">Điểm trung bình</span>
            <span className="text-lg font-semibold text-text-primary">
              {point.total_score?.toFixed(2) ?? "—"}/10
              <span className="ml-2 text-sm font-normal text-text-tertiary">
                ({point.normalized_score?.toFixed(1) ?? "—"}/100)
              </span>
            </span>
          </div>
          {point.explanation ? <p className="mt-3 text-sm leading-5 text-text-secondary">{point.explanation}</p> : null}
        </>
      ) : null}
    </section>
  );
}

function ScoreSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-busy="true">
      {DIMENSIONS.map((dimension) => <Skeleton key={dimension[1]} className="h-16 rounded-lg" />)}
    </div>
  );
}
