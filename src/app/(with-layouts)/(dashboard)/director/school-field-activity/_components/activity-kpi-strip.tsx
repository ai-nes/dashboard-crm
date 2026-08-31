import { Card } from "@/components/tailgrids/core/card";

import { activityKpis } from "./data";
import type { ActivityTone } from "./types";

const toneStyles: Record<ActivityTone, { marker: string; value: string }> = {
  primary: { marker: "bg-brand-500", value: "text-brand-500" },
  success: { marker: "bg-success-500", value: "text-success-500" },
  warning: { marker: "bg-warning-500", value: "text-warning-500" },
  error: { marker: "bg-error-500", value: "text-error-500" },
};

export default function ActivityKpiStrip() {
  return (
    <section aria-label="Tóm tắt hoạt động thực địa" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {activityKpis.map((kpi) => {
        const styles = toneStyles[kpi.tone];

        return (
          <Card key={kpi.label} className="min-w-0 p-4">
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span className={`size-2 shrink-0 rounded-full ${styles.marker}`} aria-hidden="true" />
              <span className="truncate">{kpi.label}</span>
            </div>
            <p className={`mt-3 text-2xl font-semibold tracking-[-0.6px] ${styles.value}`}>{kpi.value}</p>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">{kpi.detail}</p>
          </Card>
        );
      })}
    </section>
  );
}
