import { ArrowDownward, ArrowUpward } from "@tailgrids/icons";

import type { RevenueKpi } from "./types";
import {
  money,
  percent,
  useRevenueForecastData,
} from "./revenue-forecast-context";

const TONE_STYLES = {
  info: { dot: "bg-info-500", value: "text-info-500" },
  success: { dot: "bg-success-500", value: "text-success-500" },
  warning: { dot: "bg-warning-500", value: "text-warning-500" },
  danger: { dot: "bg-error-500", value: "text-error-500" },
  primary: { dot: "bg-brand-500", value: "text-brand-500" },
} as const;

export default function RevenueKpis() {
  const { summary } = useRevenueForecastData();
  const revenueKpis: RevenueKpi[] = [
    {
      id: "forecast-revenue",
      label: "Dự kiến khoản thu thuần",
      value: money(summary.forecastRevenue),
      target: money(summary.revenueTarget),
      achievement: percent(
        summary.revenueTarget
          ? (summary.forecastRevenue / summary.revenueTarget) * 100
          : null,
      ),
      change: "—",
      helper: "theo xu hướng hiện tại",
      tone: "primary",
    },
    {
      id: "actual-revenue",
      label: "Khoản thu đã ghi nhận",
      value: money(summary.actualRevenue),
      target: money(summary.revenueTarget),
      achievement: percent(
        summary.revenueTarget
          ? (summary.actualRevenue / summary.revenueTarget) * 100
          : null,
      ),
      change: "—",
      helper: "theo giao dịch đã ghi nhận",
      tone: "info",
    },
    {
      id: "forecast-enrollment",
      label: "Dự báo nhập học",
      value: summary.forecastEnrollment.toLocaleString("vi-VN"),
      target: summary.enrollmentTarget.toLocaleString("vi-VN"),
      achievement: percent(
        summary.enrollmentTarget
          ? (summary.forecastEnrollment / summary.enrollmentTarget) * 100
          : null,
      ),
      change: "—",
      helper: "theo mô hình hiện tại",
      tone: "success",
    },
    {
      id: "revenue-gap",
      label: "Khoảng còn thiếu so với chỉ tiêu",
      value: money(summary.revenueGap),
      target: money(summary.revenueTarget),
      achievement: percent(
        summary.revenueTarget
          ? (summary.revenueGap / summary.revenueTarget) * 100
          : null,
      ),
      change: "—",
      helper: "cần bù trước cuối kỳ",
      tone: "warning",
    },
  ];
  return (
    <section aria-labelledby="revenue-kpi-heading">
      <h2 id="revenue-kpi-heading" className="sr-only">
        Chỉ số doanh thu và dự báo
      </h2>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {revenueKpis.map((kpi) => (
          <CompactRevenueKpi key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}

function CompactRevenueKpi({ kpi }: { kpi: RevenueKpi }) {
  const tone = TONE_STYLES[kpi.tone];
  const hasChange = kpi.change !== "—";
  const isPositive = !kpi.change.startsWith("-");

  return (
    <div className="flex min-h-32 min-w-0 flex-col rounded-xl border border-card-border bg-card-background p-4">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-secondary">
          <span
            className={`size-2 shrink-0 rounded-full ${tone.dot}`}
            aria-hidden="true"
          />
          <span className="truncate">{kpi.label}</span>
        </span>
        <span className="shrink-0 text-[11px] font-medium text-text-tertiary">
          {kpi.achievement}
        </span>
      </div>

      <p className="mt-3 text-2xl leading-none font-semibold tracking-[-0.7px] text-text-primary">
        {kpi.value}
      </p>

      <div className="mt-auto flex min-w-0 items-center gap-1.5 pt-3 text-xs">
        {hasChange && (
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 font-medium ${isPositive ? "text-success-500" : "text-error-500"}`}
          >
            {kpi.change}
            {isPositive ? (
              <ArrowUpward size={13} aria-hidden="true" />
            ) : (
              <ArrowDownward size={13} aria-hidden="true" />
            )}
          </span>
        )}
        <span className="truncate text-text-tertiary">{kpi.helper}</span>
      </div>
    </div>
  );
}
