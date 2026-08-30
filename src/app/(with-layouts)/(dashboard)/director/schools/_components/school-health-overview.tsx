import { ArrowUpward, CheckCircle1, Target3 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import type { SchoolEngagementHealth, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolHealthOverviewProps {
  data: SchoolIntelligenceData;
}

const factorColors = [
  "bg-primary-500",
  "bg-violet-500",
  "bg-success-500",
  "bg-warning-500",
  "bg-orange-500",
];

const healthBadgeColor: Record<SchoolEngagementHealth["status"], "success" | "warning" | "error"> = {
  Khỏe: "success",
  "Theo dõi": "warning",
  "Cần kích hoạt": "error",
};

export default function SchoolHealthOverview({ data }: SchoolHealthOverviewProps) {
  const { engagementHealth } = data;

  return (
    <Card className="overflow-hidden border-primary-200/70 p-0">
      <div className="bg-badge-primary-background/25 p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card-background text-badge-primary-text shadow-xs"
              aria-hidden="true"
            >
              <Target3 size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Sức khỏe tuyển sinh</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Tổng hợp sức hút của trường và mức độ tương tác với đội ngũ tuyển sinh.
              </p>
            </div>
          </div>
          <Badge color={healthBadgeColor[engagementHealth.status]} size="md">
            {engagementHealth.status}
          </Badge>
        </div>

        <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[minmax(240px,0.78fr)_minmax(0,1.22fr)]">
          <div className="rounded-2xl border border-primary-200/70 bg-card-background p-5 shadow-xs">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-text-tertiary">Điểm tiềm năng trường</p>
                <p className="mt-2 text-5xl font-semibold leading-none tracking-[-2px] text-text-primary">
                  {data.potentialScore}
                  <span className="text-lg font-medium tracking-normal text-text-tertiary">/100</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-medium text-badge-success-text">
                <ArrowUpward size={13} /> Ưu tiên khai thác
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-background-soft-200" aria-hidden="true">
              <div
                className="h-full rounded-full bg-primary-500 transition-[width] duration-1000 ease-out"
                style={{ width: `${data.potentialScore}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
              <HealthStat label="Lớp 12" value={data.grade12Students.toLocaleString("vi-VN")} />
              <HealthStat label="Đang quan tâm" value={data.prospects.toLocaleString("vi-VN")} />
              <HealthStat label="Hồ sơ" value={data.applications.toLocaleString("vi-VN")} />
              <HealthStat label="Dự kiến nhập học" value={data.enrollment.toLocaleString("vi-VN")} />
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card-background p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Sức khỏe tương tác</p>
                <p className="mt-1 text-xs text-text-tertiary">Mức độ gắn kết giữa trường, học sinh và hoạt động tuyển sinh.</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {engagementHealth.score}<span className="text-sm font-medium text-text-tertiary">/100</span>
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {engagementHealth.factors.map((factor, index) => (
                <EngagementFactor
                  key={factor.label}
                  label={factor.label}
                  value={factor.value}
                  color={factorColors[index % factorColors.length]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-primary-200/70 bg-card-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex min-w-0 items-start gap-2.5">
          <CheckCircle1 size={17} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-tertiary">Hành động ưu tiên</p>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">{data.insight.recommendation}</p>
          </div>
        </div>
        <p className="shrink-0 text-xs text-text-secondary">
          Học sinh quan tâm <span className="font-semibold text-success-500">+{data.changes.prospects}%</span> so với kỳ trước
        </p>
      </div>
    </Card>
  );
}

function HealthStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background-soft-50 px-2.5 py-2">
      <p className="truncate text-[11px] text-text-tertiary" title={label}>{label}</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function EngagementFactor({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="min-w-0 truncate text-text-secondary">{label}</span>
        <strong className="shrink-0 text-text-primary">{value}</strong>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-soft-200"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full ${color} transition-[width] duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
