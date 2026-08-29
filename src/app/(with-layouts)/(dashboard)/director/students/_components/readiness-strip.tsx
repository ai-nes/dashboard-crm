import { CheckCircle1 } from "@tailgrids/icons";

import type { Student360SectionProps } from "./types";

const toneClasses = { success: "bg-success-500", warning: "bg-warning-500", error: "bg-error-500" };

export default function ReadinessStrip({ data }: Student360SectionProps) {
  return <section aria-label="Mức sẵn sàng tuyển sinh" className="grid divide-y divide-card-border rounded-xl border border-card-border bg-card-background sm:grid-cols-3 sm:divide-x sm:divide-y-0">
    {data.readiness.map((item) => <div key={item.label} className="p-4"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-medium text-text-primary"><CheckCircle1 size={16} className={item.tone === "success" ? "text-success-500" : "text-warning-500"} aria-hidden="true" />{item.label}</span><span className="text-sm font-semibold text-text-primary">{item.value}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-soft-200"><div className={`h-full rounded-full ${toneClasses[item.tone]}`} style={{ width: `${item.value}%` }} /></div><p className="mt-2 text-xs text-text-tertiary">{item.detail}</p></div>)}
  </section>;
}
