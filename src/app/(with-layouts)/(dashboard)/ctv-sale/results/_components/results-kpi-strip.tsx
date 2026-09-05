import { ArrowUpward, CheckCircle1, ClockThree, Target3, UserMultiple1 } from "@tailgrids/icons";

import type { ResultKpi } from "./data";

const kpiIcons = {
  assigned: UserMultiple1,
  contacted: ClockThree,
  connected: CheckCircle1,
  qualified: Target3,
  transferred: ArrowUpward,
} as const;

const kpiStyles = {
  primary: { icon: "bg-badge-primary-background text-badge-primary-text", value: "text-primary-600" },
  info: { icon: "bg-badge-sky-background text-info-500", value: "text-info-600" },
  success: { icon: "bg-badge-success-background text-success-500", value: "text-success-600" },
  warning: { icon: "bg-badge-warning-background text-warning-500", value: "text-warning-600" },
} as const;

interface ResultsKpiStripProps {
  kpis: ResultKpi[];
}

export default function ResultsKpiStrip({ kpis }: ResultsKpiStripProps) {
  return (
    <section aria-label="Chỉ số kết quả cá nhân" className="grid grid-cols-2 divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card-background sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = kpiIcons[kpi.id as keyof typeof kpiIcons];
        const styles = kpiStyles[kpi.tone];

        return (
          <div key={kpi.id} className="flex min-w-0 items-start gap-3 p-4 lg:p-5">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`} aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-text-tertiary">{kpi.label}</p>
              <p className={`mt-1 text-[25px] leading-7 font-semibold tracking-[-0.5px] ${styles.value}`}>{kpi.value}</p>
              <p className="mt-1 truncate text-[11px] leading-4 text-text-secondary">{kpi.note}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
