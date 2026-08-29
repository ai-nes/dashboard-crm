import { Card } from "@/components/tailgrids/core/card";

import type { WorkspaceMetric, WorkspaceTone } from "./types";

const TONE_STYLES: Record<WorkspaceTone, { value: string; marker: string }> = {
  primary: { value: "text-brand-500", marker: "bg-brand-500" },
  success: { value: "text-success-500", marker: "bg-success-500" },
  warning: { value: "text-warning-500", marker: "bg-warning-500" },
  error: { value: "text-error-500", marker: "bg-error-500" },
};

export default function WorkspaceMetricCard({ metric }: { metric: WorkspaceMetric }) {
  const style = TONE_STYLES[metric.tone];

  return (
    <Card className="min-w-0 p-4">
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <span className={`size-2 rounded-full ${style.marker}`} aria-hidden="true" />
        <span className="truncate">{metric.label}</span>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-[-0.6px] ${style.value}`}>{metric.value}</p>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">{metric.detail}</p>
    </Card>
  );
}
