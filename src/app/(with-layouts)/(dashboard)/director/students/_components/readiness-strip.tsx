import { CheckCircle1, FileText, TrendUp2, UserMultiple1 } from "@tailgrids/icons";

import type { Student360SectionProps } from "./types";

const toneClasses = {
  success: { surface: "border-success-500/25 bg-badge-success-background", icon: "bg-card-background text-success-500", value: "text-success-500", bar: "bg-success-500" },
  warning: { surface: "border-warning-500/30 bg-badge-warning-background", icon: "bg-card-background text-warning-500", value: "text-warning-500", bar: "bg-warning-500" },
  error: { surface: "border-error-500/25 bg-badge-error-background", icon: "bg-card-background text-error-500", value: "text-error-500", bar: "bg-error-500" },
};

const readinessIcons = [FileText, UserMultiple1, TrendUp2];

export default function ReadinessStrip({ data }: Student360SectionProps) {
  return <section aria-label="Mức sẵn sàng tuyển sinh" className="grid gap-4 sm:grid-cols-3">
    {data.readiness.map((item, index) => {
      const tone = toneClasses[item.tone];
      const Icon = readinessIcons[index] ?? CheckCircle1;
      return <article key={item.label} className={`rounded-xl border p-4 ${tone.surface}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className={`flex size-9 items-center justify-center rounded-xl ${tone.icon}`} aria-hidden="true"><Icon size={17} /></span><div><p className="text-xs font-medium text-text-secondary">Mức sẵn sàng</p><p className="mt-0.5 text-sm font-semibold text-text-primary">{item.label}</p></div></div><span className={`text-xl font-semibold tracking-[-0.4px] ${tone.value}`}>{item.value}%</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-card-background"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${item.value}%` }} /></div><p className="mt-2 text-xs leading-5 text-text-secondary">{item.detail}</p></article>;
    })}
  </section>;
}
