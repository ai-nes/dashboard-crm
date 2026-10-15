"use client";
import { Check, InfoCircle, Pencil1 } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  getDimensionLevelColor,
  getRefTypeLabel,
} from "./student-analysis-display";
import type { AnalysisDimensionView } from "./student-analysis-view";

interface Props {
  item: AnalysisDimensionView;
  previous?: AnalysisDimensionView;
}
export default function StudentAnalysisEvidence({ item, previous }: Props) {
  const delta =
    item.score !== null &&
    previous?.score !== undefined &&
    previous.score !== null
      ? item.score - previous.score
      : null;
  return (
    <section
      className="min-w-0 p-4 sm:p-5"
      aria-live="polite"
      aria-label={`Dẫn chứng ${item.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-text-primary">
            {item.label}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {delta === null
              ? "Chưa đủ dữ liệu so sánh"
              : delta === 0
                ? "Mức chưa thay đổi so với lần trước"
                : `${delta > 0 ? "Tăng" : "Giảm"} ${Math.abs(delta)} điểm chuẩn hoá so với lần trước`}
          </p>
        </div>
        <p className="shrink-0 text-2xl font-semibold tabular-nums text-text-primary">
          {item.score ?? "—"}
          {item.score !== null && (
            <span className="ml-1 text-xs font-normal text-text-secondary">
              / 100
            </span>
          )}
        </p>
      </div>
      <div className="mt-3">
        <Badge
          size="sm"
          color={
            item.dimension ? getDimensionLevelColor(item.dimension) : "gray"
          }
        >
          {item.assessment}
        </Badge>
      </div>
      <p className="mt-3 break-words text-sm leading-6 text-text-secondary">
        {item.dimension?.summary?.trim() || "Chưa có đánh giá cho chiều này."}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-primary">Dẫn chứng</h4>
        <span className="text-xs text-text-secondary">
          {item.evidence.length} nguồn
        </span>
      </div>
      <ul className="mt-3 divide-y divide-card-border border-t border-card-border">
        {item.evidence.map((entry, index) => (
          <li
            key={`${entry.ref.type}-${entry.ref.id}-${index}`}
            className="flex min-w-0 gap-3 py-4"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background-gray-secondary text-text-secondary">
              <Pencil1 size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary">
                {getRefTypeLabel(entry.ref.type)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-text-secondary">
                {entry.note?.trim() || "Chưa có mô tả dẫn chứng."}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {!item.evidence.length && (
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Chưa có dẫn chứng cho chiều này.
        </p>
      )}
      {!!item.missing.length && (
        <div className="mt-4 rounded-lg bg-background-gray-secondary p-4">
          <h4 className="text-xs font-medium text-text-primary">
            Thông tin còn thiếu
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-text-secondary">
            {item.missing.map((text, index) => (
              <li key={index} className="break-words">
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-4 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-2">
          {item.evidenceQuality === "clear" ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <InfoCircle size={14} aria-hidden="true" />
          )}
          {item.evidenceQuality === "clear"
            ? "Dẫn chứng rõ"
            : item.evidenceQuality === "partial"
              ? "Cần thêm dẫn chứng"
              : "Chưa đủ dẫn chứng"}
        </span>
        <span>
          Nguồn mức:{" "}
          {item.dimension?.level_source === "crm"
            ? "CRM"
            : item.dimension?.level_source === "ai"
              ? "AI"
              : "Chưa xác định"}
        </span>
      </div>
    </section>
  );
}
