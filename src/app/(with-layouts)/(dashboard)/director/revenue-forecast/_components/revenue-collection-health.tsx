import { CheckCircle1 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  money,
  percent,
  useRevenueForecastData,
} from "./revenue-forecast-context";

export default function RevenueCollectionHealth() {
  const { collectionHealth } = useRevenueForecastData();
  const rate = collectionHealth.onTimeRate ?? 0;
  const statusTone =
    collectionHealth.status === "stable"
      ? "bg-badge-success-background text-badge-success-text"
      : collectionHealth.status === "watch"
        ? "bg-badge-warning-background text-badge-warning-text"
        : "bg-badge-error-background text-badge-error-text";
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Tiến độ thu & đối soát</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Theo dõi khoản thu và giao dịch đã xử lý
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusTone}`}
        >
          {collectionHealth.status === "stable"
            ? "Ổn định"
            : collectionHealth.status === "watch"
              ? "Theo dõi"
              : "Cần can thiệp"}
        </span>
      </CardHeader>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-text-tertiary">Khoản thu đúng hạn</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-1px] text-text-primary">
            {percent(rate)}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-card-border">
        <div
          className="h-full rounded-full bg-success-500"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>

      <div className="mt-5 space-y-4 border-t border-card-border pt-5">
        <HealthMetric
          label="Giao dịch đã đối soát"
          value={`${collectionHealth.reconciledCount.toLocaleString("vi-VN")} / ${collectionHealth.transactionCount.toLocaleString("vi-VN")}`}
          note="tỷ lệ thu đúng hạn hiển thị ở trên"
        />
        <HealthMetric
          label="Khoản đang chờ thu"
          value={money(collectionHealth.outstandingAmount)}
          note="đang chờ xử lý"
          valueClassName="text-badge-warning-text"
        />
        <HealthMetric
          label="Xử lý đúng hạn"
          value={percent(collectionHealth.processingOnTimeRate)}
          note="mục tiêu tối thiểu 90%"
          valueClassName="text-success-500"
        />
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-badge-primary-background p-3 text-[11px] leading-5 text-badge-primary-text">
        <CheckCircle1
          size={14}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <span>
          {collectionHealth.warnings[0] ??
            "Chưa ghi nhận cảnh báo từ dữ liệu thu và đối soát."}
        </span>
      </div>
    </Card>
  );
}

function HealthMetric({
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
