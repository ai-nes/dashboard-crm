import { ArrowUpward } from "@tailgrids/icons";

import { demographicKpis } from "./data";
import type { DemographicTone } from "./types";

const toneStyles: Record<DemographicTone, { dot: string; icon: string; bar: string; text: string }> = {
  primary: { dot: "bg-brand-500", icon: "bg-badge-primary-background", bar: "bg-brand-500", text: "text-brand-500" },
  info: { dot: "bg-info-500", icon: "bg-badge-sky-background", bar: "bg-info-500", text: "text-info-500" },
  success: { dot: "bg-success-500", icon: "bg-badge-success-background", bar: "bg-success-500", text: "text-success-500" },
  warning: { dot: "bg-warning-500", icon: "bg-badge-warning-background", bar: "bg-warning-500", text: "text-warning-500" },
  danger: { dot: "bg-error-500", icon: "bg-badge-error-background", bar: "bg-error-500", text: "text-error-500" },
};

export default function OverviewKpiStrip() {
  return (
    <section aria-label="Chỉ số tổng quan người học" className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {demographicKpis.map((kpi) => {
        const tone = toneStyles[kpi.tone];
        return (
          <article key={kpi.id} className="rounded-2xl border border-card-border/70 bg-card-background p-5">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2.5"><span className={`flex size-9 items-center justify-center rounded-xl ${tone.icon}`} aria-hidden="true"><span className={`size-2.5 rounded-full ${tone.dot}`} /></span><p className="text-sm font-medium text-text-secondary">{kpi.label}</p></div><span className={`inline-flex items-center gap-1 text-xs font-semibold ${tone.text}`}><ArrowUpward size={13} aria-hidden="true" />{kpi.change}</span></div>
            <p className="mt-5 text-3xl font-semibold tracking-[-0.8px] text-text-primary">{kpi.value}</p>
            <p className="mt-1 text-xs text-text-tertiary">{kpi.helper}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background-gray-secondary"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${kpi.progress}%` }} /></div>
          </article>
        );
      })}
    </section>
  );
}
