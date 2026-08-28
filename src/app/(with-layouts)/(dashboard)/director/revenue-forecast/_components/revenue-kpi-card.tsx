import { ArrowDownward, ArrowUpward } from "@tailgrids/icons";

import type { RevenueKpi } from "./types";

const TONE_STYLES = {
  primary: { dot: "bg-brand-500", icon: "bg-badge-primary-background text-badge-primary-text" },
  info: { dot: "bg-info-500", icon: "bg-badge-sky-background text-badge-sky-text" },
  success: { dot: "bg-success-500", icon: "bg-badge-success-background text-badge-success-text" },
  warning: { dot: "bg-warning-500", icon: "bg-badge-warning-background text-badge-warning-text" },
  danger: { dot: "bg-error-500", icon: "bg-badge-error-background text-badge-error-text" },
} as const;

export default function RevenueKpiCard({ kpi }: { kpi: RevenueKpi }) {
  const tone = TONE_STYLES[kpi.tone];
  const isPositive = !kpi.change.startsWith("-");

  return (
    <div className="flex h-full min-h-52 flex-col rounded-2xl border border-card-border/70 bg-card-background p-6 sm:p-7">
      <div className="flex min-h-12 min-w-0 items-start gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`} aria-hidden="true">
          <span className={`size-3 rounded-full ${tone.dot}`} />
        </span>
        <p className="line-clamp-2 pt-1 text-base font-medium leading-6 text-text-secondary">{kpi.label}</p>
      </div>

      <div className="mt-7 flex min-h-10 items-end justify-between gap-3">
        <p className="text-4xl leading-none font-semibold tracking-[-1px] text-text-primary">{kpi.value}</p>
        <span className="text-xs font-semibold text-text-tertiary">{kpi.achievement}</span>
      </div>

      <div className="mt-2 flex min-h-12 items-start gap-x-2 gap-y-1 text-base">
        <span className={`inline-flex shrink-0 items-center gap-1 font-medium ${isPositive ? "text-success-500" : "text-error-500"}`}>
          {kpi.change}
          {isPositive ? <ArrowUpward size={16} aria-hidden="true" /> : <ArrowDownward size={16} aria-hidden="true" />}
        </span>
        <span className="line-clamp-2 text-text-tertiary">{kpi.helper}</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-card-border pt-3 text-xs">
        <span className="text-text-tertiary">Mục tiêu</span>
        <span className="font-medium text-text-secondary">{kpi.target}</span>
      </div>
    </div>
  );
}
