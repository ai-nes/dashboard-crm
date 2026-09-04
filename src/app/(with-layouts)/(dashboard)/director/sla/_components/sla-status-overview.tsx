import { Card } from "@/components/tailgrids/core/card";

import { slaStatusBuckets } from "./data";
import type { SlaStatusBucket } from "./types";

const toneStyles = {
  success: {
    surface: "bg-success-500/5",
    marker: "bg-success-500",
    bar: "bg-success-500",
  },
  warning: {
    surface: "bg-warning-500/5",
    marker: "bg-warning-500",
    bar: "bg-warning-500",
  },
  error: {
    surface: "bg-error-500/5",
    marker: "bg-error-500",
    bar: "bg-error-500",
  },
} as const;

interface SlaStatusOverviewProps {
  buckets?: SlaStatusBucket[];
}

export default function SlaStatusOverview({ buckets }: SlaStatusOverviewProps) {
  const rows = buckets ?? slaStatusBuckets;

  return (
    <section className="min-w-0" aria-labelledby="sla-status-heading">
      <div className="mb-4">
        <h2
          id="sla-status-heading"
          className="text-base font-semibold text-text-primary"
        >
          Tình trạng xử lý hồ sơ
        </h2>
      </div>

      {rows.length === 0 ? (
        <Card className="min-w-0 p-5">
          <p className="text-center text-sm text-text-tertiary">Chưa có dữ liệu.</p>
        </Card>
      ) : (
      <div className="grid gap-3 xl:grid-cols-3">
        {rows.map((bucket) => {
          const styles = toneStyles[bucket.tone];

          return (
            <Card
              key={bucket.label}
              className={`min-w-0 p-5 ${styles.surface}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <span
                    className={`size-2 rounded-full ${styles.marker}`}
                    aria-hidden="true"
                  />
                  {bucket.label}
                </p>
                <span className="shrink-0 text-xs font-medium text-text-secondary">
                  Tỷ trọng{" "}
                  <strong className="font-semibold text-text-primary">
                    {bucket.share}
                  </strong>
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.8px] text-text-primary">
                    {bucket.value}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">hồ sơ</p>
                </div>
                <p className="max-w-52 text-right text-xs leading-5 text-text-secondary">
                  {bucket.detail}
                </p>
              </div>
              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-background-soft-200"
                role="progressbar"
                aria-label={`Tỷ trọng ${bucket.label}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={bucket.shareValue}
              >
                <div
                  className={`h-full rounded-full ${styles.bar}`}
                  style={{ width: `${bucket.shareValue}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </section>
  );
}
