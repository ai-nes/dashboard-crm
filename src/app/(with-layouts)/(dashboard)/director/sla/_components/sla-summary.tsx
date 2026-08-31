import { slaMetrics } from "./data";

const valueClassByTone = {
  success: "text-success-500",
  warning: "text-warning-500",
  error: "text-error-500",
} as const;

const markerClassByTone = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
} as const;

export default function SlaSummary() {
  return (
    <section className="grid divide-y divide-card-border rounded-xl border-[0.5px] border-card-border bg-card-background sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4" aria-label="Tóm tắt thời hạn xử lý">
      {slaMetrics.map((metric) => (
        <div key={metric.label} className="min-w-0 p-4 lg:p-5">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className={`size-2 rounded-full ${markerClassByTone[metric.tone]}`} aria-hidden="true" />
            <span className="truncate">{metric.label}</span>
          </div>
          <p className={`mt-3 text-2xl font-semibold tracking-[-0.6px] ${valueClassByTone[metric.tone]}`}>{metric.value}</p>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">{metric.detail}</p>
        </div>
      ))}
    </section>
  );
}
