import { ArrowDownward, ArrowUpward } from "@tailgrids/icons";

import type { DirectorKpi } from "./types";

const TONE_STYLES = {
  primary: {
    dot: "bg-brand-500",
    value: "text-brand-500",
  },
  info: {
    dot: "bg-blue-500",
    value: "text-blue-600",
  },
  success: {
    dot: "bg-green-500",
    value: "text-green-600",
  },
  warning: {
    dot: "bg-orange-400",
    value: "text-orange-600",
  },
  danger: {
    dot: "bg-red-500",
    value: "text-red-600",
  },
} as const;

export default function DirectorKpiCard({ kpi }: { kpi: DirectorKpi }) {
  const tone = TONE_STYLES[kpi.tone];
  const isPositive = !kpi.change.startsWith("-");

  return (
    <div className="rounded-xl border-[0.5px] border-card-border bg-card-background p-4 shadow-[0_1px_2px_rgba(16,24,40,0.02)] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${tone.dot}`} aria-hidden="true" />
          <p className="text-sm font-medium text-text-secondary">{kpi.label}</p>
        </div>
        <span className={`text-xs font-semibold ${tone.value}`}>{kpi.change}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl leading-none font-semibold tracking-[-0.5px] text-text-primary sm:text-[28px]">
          {kpi.value}
        </p>
        <span
          className={`flex size-7 items-center justify-center rounded-full ${
            isPositive ? "bg-badge-success-background text-badge-success-icon-color" : "bg-badge-error-background text-badge-error-icon-color"
          }`}
          aria-label={isPositive ? "Tăng" : "Giảm"}
        >
          {isPositive ? <ArrowUpward size={14} /> : <ArrowDownward size={14} />}
        </span>
      </div>

      <p className="mt-2 text-xs text-text-tertiary">{kpi.helper}</p>
    </div>
  );
}

