import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SalePipelineHealth } from "@/services/api/sale";

interface PipelineHealthProps {
  data: SalePipelineHealth;
}

interface HealthMetricProps {
  label: string;
  value: number;
  tone: "default" | "warning" | "error";
}

const toneClasses: Record<HealthMetricProps["tone"], string> = {
  default: "text-text-primary",
  warning: "text-warning-600",
  error: "text-badge-error-text",
};

function HealthMetric({ label, value, tone }: HealthMetricProps) {
  return (
    <div className="rounded-xl border border-card-border bg-background-soft-50 px-4 py-3.5">
      <p className="text-xs font-medium text-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.5px] ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-text-secondary">hồ sơ</p>
    </div>
  );
}

export default function PipelineHealth({ data }: PipelineHealthProps) {
  const maxCount = Math.max(...data.agingBuckets.map((bucket) => bucket.count), 1);

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Sức khỏe pipeline</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các tín hiệu cho biết hồ sơ nào cần được đẩy tiếp hoặc xử lý ngay.</p>
        </div>
      </CardHeader>

      <div className="mt-5 grid gap-3 sm:grid-cols-2" role="list" aria-label="Các chỉ số sức khỏe pipeline">
        <HealthMetric label="Cần follow-up" value={data.followUpDue} tone="default" />
        <HealthMetric label="Quá hạn" value={data.overdue} tone="error" />
        <HealthMetric label="Vượt SLA" value={data.slaBreach} tone="error" />
        <HealthMetric label="Không hoạt động" value={data.noActivity} tone="warning" />
      </div>

      <div className="mt-6 border-t border-card-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Thời gian ở giai đoạn hiện tại</h3>
          <span className="text-[11px] text-text-tertiary">Số hồ sơ</span>
        </div>
        <div className="mt-4 space-y-3" role="list" aria-label="Phân bổ thời gian ở giai đoạn hiện tại">
          {data.agingBuckets.map((bucket) => (
            <div key={bucket.id} role="listitem">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-text-secondary">{bucket.label}</span>
                <span className="shrink-0 font-semibold text-text-primary">{bucket.count}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background-soft-100">
                <div
                  className="h-full rounded-full bg-primary-500 transition-[width]"
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
