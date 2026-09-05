import { CalendarTime, CheckCircle1, ClockThree, TrendUp2 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { ProcessingMetric } from "./data";

const metricIcons = {
  "on-time": CheckCircle1,
  "response-time": ClockThree,
  "follow-up-count": CalendarTime,
  "transfer-rate": TrendUp2,
} as const;

const metricStyles = {
  primary: { icon: "bg-badge-primary-background text-badge-primary-text", value: "text-primary-600" },
  info: { icon: "bg-badge-sky-background text-info-500", value: "text-info-600" },
  success: { icon: "bg-badge-success-background text-success-500", value: "text-success-600" },
  warning: { icon: "bg-badge-warning-background text-warning-500", value: "text-warning-600" },
} as const;

interface ProcessingPerformanceProps {
  metrics: ProcessingMetric[];
}

export default function ProcessingPerformance({ metrics }: ProcessingPerformanceProps) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Hiệu suất xử lý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các chỉ số giúp cải thiện chất lượng làm việc hằng ngày.</p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-[11px] font-semibold text-badge-primary-text">Mục tiêu cá nhân</span>
      </CardHeader>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metricIcons[metric.id as keyof typeof metricIcons];
          const styles = metricStyles[metric.tone];

          return (
            <div key={metric.id} className="rounded-xl border border-card-border bg-background-soft-50 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <span className={`flex size-8 items-center justify-center rounded-lg ${styles.icon}`} aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className={`text-xl leading-7 font-semibold tracking-[-0.5px] ${styles.value}`}>{metric.value}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-text-primary">{metric.label}</p>
              <p className="mt-1 text-[11px] text-text-tertiary">{metric.note}</p>
              {metric.progress != null ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-soft-200" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${metric.progress}%` }} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
