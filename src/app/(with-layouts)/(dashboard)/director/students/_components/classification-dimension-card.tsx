import { CheckCircle1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentClassificationDimension } from "@/services/api/students/types";

const toneStyles = {
  primary: "bg-badge-primary-background text-badge-primary-text",
  success: "bg-badge-success-background text-badge-success-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
  sky: "bg-badge-sky-background text-badge-sky-text",
  gray: "bg-badge-neutral-background text-badge-neutral-text",
} as const;

interface ClassificationDimensionCardProps {
  dimension: StudentClassificationDimension;
  index: number;
}

export default function ClassificationDimensionCard({ dimension, index }: ClassificationDimensionCardProps) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl bg-background-gray-primary p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${toneStyles[dimension.tone] ?? toneStyles.gray}`} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <Badge color={dimension.tone ?? "gray"}>{dimension.value || "-"}</Badge>
      </div>
      <p className="mt-4 text-xs font-medium text-text-tertiary">{dimension.label || "-"}</p>
      <p className="mt-1 text-sm leading-6 font-semibold text-text-primary">{dimension.description || "-"}</p>
      <div className="mt-4 border-t border-card-border pt-3">
        <p className="text-[11px] font-medium text-text-tertiary">Lý do phân loại</p>
        {dimension.evidence?.length ? (
          <ul className="mt-2 space-y-2">
            {dimension.evidence.map((evidence) => (
              <li key={evidence} className="flex items-start gap-2 text-xs leading-5 text-text-secondary">
                <CheckCircle1 size={14} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />
                {evidence}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-text-tertiary">-</p>
        )}
      </div>
    </article>
  );
}
