import { slaStatusBuckets } from "./data";

const toneStyles = {
  success: { marker: "bg-success-500", value: "text-success-500", bar: "bg-success-500" },
  warning: { marker: "bg-warning-500", value: "text-warning-500", bar: "bg-warning-500" },
  error: { marker: "bg-error-500", value: "text-error-500", bar: "bg-error-500" },
} as const;

export default function SlaStatusOverview() {
  return (
    <section className="min-w-0" aria-labelledby="sla-status-heading">
      <div className="mb-4">
        <h2 id="sla-status-heading" className="text-base font-semibold text-text-primary">Tình trạng thời hạn xử lý</h2>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {slaStatusBuckets.map((bucket) => {
          const styles = toneStyles[bucket.tone];

          return (
            <div key={bucket.label} className="min-w-0 rounded-xl bg-background-soft-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium text-text-primary"><span className={`size-2 rounded-full ${styles.marker}`} aria-hidden="true" />{bucket.label}</p>
                <span className="shrink-0 text-xs font-semibold text-text-tertiary">{bucket.share}</span>
              </div>
              <p className={`mt-3 text-3xl font-semibold tracking-[-0.8px] ${styles.value}`}>{bucket.value}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{bucket.detail}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background-soft-200" aria-hidden="true">
                <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${bucket.shareValue}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
