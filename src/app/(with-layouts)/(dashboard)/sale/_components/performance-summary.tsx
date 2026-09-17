import {
  CheckCircle1,
  FileTextMultiple,
  Target3,
  UserMultiple1,
} from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import type { SalePerformance } from "@/services/api/sale";

import type { SaleDashboardMetric } from "./sale-dashboard-detail.types";
type MetricTone = "primary" | "success" | "warning" | "danger" | "violet";
type MetricIcon =
  "enrollment" | "target" | "forecast" | "opportunities" | "lost" | "rate";

interface PerformanceSummaryProps {
  data: SalePerformance;
  onOpenDetail: (metric: SaleDashboardMetric) => void;
}

interface MetricContentProps {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
  icon: MetricIcon;
  emphasis?: "primary" | "secondary";
}

const toneStyles: Record<MetricTone, { icon: string; value: string }> = {
  primary: {
    icon: "bg-badge-primary-background text-badge-primary-text",
    value: "text-primary-600",
  },
  success: {
    icon: "bg-badge-success-background text-badge-success-text",
    value: "text-success-600",
  },
  warning: {
    icon: "bg-badge-warning-background text-badge-warning-text",
    value: "text-warning-600",
  },
  danger: {
    icon: "bg-badge-error-background text-badge-error-text",
    value: "text-badge-error-text",
  },
  violet: {
    icon: "bg-badge-violet-background text-badge-violet-text",
    value: "text-badge-violet-text",
  },
};

const metricIcons = {
  enrollment: CheckCircle1,
  target: Target3,
  forecast: Target3,
  opportunities: UserMultiple1,
  lost: FileTextMultiple,
  rate: Target3,
} as const;

function formatCount(value: number | null): string {
  return value === null ? "—" : new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value: number | null): string {
  return value === null
    ? "—"
    : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatCoverage(value: number | null): string {
  return value === null
    ? "Chưa đủ dữ liệu"
    : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value)}x`;
}

function MetricContent({
  label,
  value,
  detail,
  tone,
  icon,
  emphasis = "primary",
}: MetricContentProps) {
  const Icon = metricIcons[icon];
  const styles = toneStyles[tone];
  const isPrimary = emphasis === "primary";

  return (
    <span className="block w-full">
      <span className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 text-xs font-medium text-text-secondary">
          {label}
        </span>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>
      </span>
      <span
        className={`mt-3 block break-words font-semibold tracking-[-0.6px] ${styles.value} ${isPrimary ? "text-[28px] leading-8 sm:text-3xl" : "text-xl leading-6"}`}
      >
        {value}
      </span>
      <span
        className={`mt-1 block leading-5 text-text-tertiary ${isPrimary ? "text-xs" : "text-[11px]"}`}
      >
        {detail}
      </span>
    </span>
  );
}

function PrimaryMetricCard({
  metric,
  onOpenDetail,
  ...content
}: MetricContentProps & {
  metric: SaleDashboardMetric;
  onOpenDetail: (metric: SaleDashboardMetric) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      aria-label={`Mở chi tiết ${content.label.toLocaleLowerCase("vi-VN")}`}
      aria-haspopup="dialog"
      onPress={() => onOpenDetail(metric)}
      className="group h-full min-h-36 w-full min-w-0 cursor-pointer flex-col items-stretch justify-start rounded-xl border-[0.5px] border-card-border bg-card-background px-4 py-4 text-left font-normal text-text-primary transition-colors hover:border-primary-200 hover:bg-primary-50/30 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500 data-[focused=true]:ring-2 data-[focused=true]:ring-primary-500 sm:min-h-40 sm:p-5"
    >
      <MetricContent {...content} />
    </Button>
  );
}

function SecondaryMetricCard({
  metric,
  onOpenDetail,
  ...content
}: MetricContentProps & {
  metric: SaleDashboardMetric;
  onOpenDetail: (metric: SaleDashboardMetric) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      aria-label={`Mở chi tiết ${content.label.toLocaleLowerCase("vi-VN")}`}
      aria-haspopup="dialog"
      onPress={() => onOpenDetail(metric)}
      className="group h-full min-h-28 w-full min-w-0 cursor-pointer flex-col items-stretch justify-start rounded-xl border-[0.5px] border-card-border bg-card-background px-3.5 py-3.5 text-left font-normal text-text-primary transition-colors hover:border-primary-200 hover:bg-primary-50/30 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500 data-[focused=true]:ring-2 data-[focused=true]:ring-primary-500 sm:p-4"
    >
      <MetricContent {...content} emphasis="secondary" />
    </Button>
  );
}

export default function PerformanceSummary({
  data,
  onOpenDetail,
}: PerformanceSummaryProps) {
  const targetExists = data.target !== null && data.target > 0;
  const achievement =
    data.achievement ??
    (targetExists ? (data.enrollment / data.target!) * 100 : null);
  const remaining = targetExists
    ? (data.remaining ?? Math.max(data.target! - data.enrollment, 0))
    : null;
  const canMeasureCoverage = remaining !== null && remaining > 0;
  const coverage = canMeasureCoverage
    ? (data.pipelineCoverage ??
      (data.expectedEnrollment !== null
        ? data.expectedEnrollment / remaining
        : null))
    : null;
  const decidedOpportunities =
    data.lostOpportunities === null
      ? null
      : data.enrollment + data.lostOpportunities;
  const enrollmentRate =
    decidedOpportunities && decidedOpportunities > 0
      ? (data.enrollment / decidedOpportunities) * 100
      : null;

  const remainingValue =
    remaining === null ? "Chưa cấu hình" : formatCount(remaining);
  const remainingDetail =
    remaining === null
      ? "Chưa có chỉ tiêu kỳ này"
      : remaining === 0
        ? "Đã hoàn thành chỉ tiêu"
        : targetExists
          ? `${formatPercent(achievement)} chỉ tiêu đã đạt`
          : "Còn thiếu so với chỉ tiêu";
  const coverageValue =
    remaining === null
      ? "Chưa cấu hình"
      : remaining === 0
        ? "Đã đạt chỉ tiêu"
        : formatCoverage(coverage);
  const coverageDetail =
    remaining === null
      ? "Cần cấu hình chỉ tiêu kỳ tuyển sinh"
      : remaining === 0
        ? "Không còn thiếu so với chỉ tiêu"
        : data.expectedEnrollment === null
          ? "Chưa có dữ liệu dự báo"
          : `${formatCount(data.expectedEnrollment)} dự kiến / ${formatCount(remaining)} còn thiếu`;
  const rateDetail =
    decidedOpportunities === null
      ? "Chưa đủ dữ liệu cơ hội đã có kết quả"
      : decidedOpportunities === 0
        ? "Chưa có cơ hội đã đóng"
        : `${formatCount(data.enrollment)} / ${formatCount(decidedOpportunities)} kết quả cuối`;

  return (
    <section
      aria-label="Kết quả tuyển sinh và các chỉ số chính"
      className="space-y-3"
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
        <PrimaryMetricCard
          label="Đã nhập học"
          value={formatCount(data.enrollment)}
          detail={
            targetExists
              ? `Chỉ tiêu ${formatCount(data.target)} · đạt ${formatPercent(achievement)}`
              : "Kết quả trong kỳ tuyển sinh"
          }
          tone="success"
          icon="enrollment"
          metric="enrollment"
          onOpenDetail={onOpenDetail}
        />
        <PrimaryMetricCard
          label="Dự kiến nhập học"
          value={formatCount(data.expectedEnrollment)}
          detail="Dự báo từ các cơ hội đang mở · không phải kết quả chắc chắn"
          tone="violet"
          icon="forecast"
          metric="forecast"
          onOpenDetail={onOpenDetail}
        />
        <PrimaryMetricCard
          label="Độ phủ chỉ tiêu"
          value={coverageValue}
          detail={coverageDetail}
          tone="primary"
          icon="target"
          metric="coverage"
          onOpenDetail={onOpenDetail}
        />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <SecondaryMetricCard
          label="Còn thiếu"
          value={remainingValue}
          detail={remainingDetail}
          tone={remaining !== null && remaining > 0 ? "warning" : "primary"}
          icon="target"
          metric="remaining"
          onOpenDetail={onOpenDetail}
        />
        <SecondaryMetricCard
          label="Cơ hội đang mở"
          value={formatCount(data.openOpportunities)}
          detail={`${formatCount(data.newOpportunities)} cơ hội mới trong kỳ`}
          tone="primary"
          icon="opportunities"
          metric="open-opportunities"
          onOpenDetail={onOpenDetail}
        />
        <SecondaryMetricCard
          label="Tỷ lệ nhập học"
          value={formatPercent(enrollmentRate)}
          detail={rateDetail}
          tone="success"
          icon="rate"
          metric="enrollment-rate"
          onOpenDetail={onOpenDetail}
        />
        <SecondaryMetricCard
          label="Cơ hội không chuyển đổi"
          value={formatCount(data.lostOpportunities)}
          detail="Cơ hội đã đóng · không gồm hồ sơ đang mở"
          tone="danger"
          icon="lost"
          metric="lost-opportunities"
          onOpenDetail={onOpenDetail}
        />
      </div>
    </section>
  );
}
