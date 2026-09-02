import { CheckCircle1 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  money,
  percent,
  useRevenueForecastData,
} from "./revenue-forecast-context";

export default function RevenueSummaryRail() {
  const { summary } = useRevenueForecastData();
  const achievement = summary.revenueTarget
    ? (summary.forecastRevenue / summary.revenueTarget) * 100
    : 0;
  return (
    <Card className="flex min-w-0 flex-col bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Tổng quan tài chính</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Bức tranh khoản thu của niên khóa
          </p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2 py-1 text-[11px] font-semibold text-badge-primary-text">
          AI
        </span>
      </CardHeader>

      <div className="mt-7">
        <p className="text-xs text-text-tertiary">Khoản thu thuần dự kiến</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
          <p className="text-[38px] leading-none font-semibold tracking-[-1.5px] text-text-primary">
            {money(summary.forecastRevenue)}
          </p>
          <span className="rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-semibold text-badge-success-text">
            {percent(achievement)} chỉ tiêu
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[11px] text-text-tertiary">
          <span>Tiến độ chỉ tiêu</span>
          <span className="font-medium text-text-secondary">
            {money(summary.revenueTarget)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-badge-primary-background">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-card-border pt-5">
        <SummaryMetric
          label="Độ tin cậy mô hình"
          value={percent(summary.modelConfidence)}
          note="đang trong ngưỡng tốt"
          valueClassName="text-badge-success-text"
        />
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-card-border pt-5 text-xs text-badge-success-text">
        <CheckCircle1 size={15} aria-hidden="true" />
        <span>Mô hình đang hoạt động</span>
      </div>
    </Card>
  );
}

function SummaryMetric({
  label,
  value,
  note,
  valueClassName = "text-text-primary",
}: {
  label: string;
  value: string;
  note: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-text-secondary">
          {label}
        </p>
        <p className="mt-1 truncate text-[11px] text-text-tertiary">{note}</p>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
