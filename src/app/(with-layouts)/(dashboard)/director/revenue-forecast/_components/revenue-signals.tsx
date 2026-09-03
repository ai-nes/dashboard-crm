import { ArrowRight, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { useRevenueForecastData } from "./revenue-forecast-context";

export default function RevenueSignals() {
  const { signals } = useRevenueForecastData();
  const positiveDrivers = signals.positive.map((text, index) => ({
    id: `positive-${index}`,
    label: "Tín hiệu tích cực",
    description: text,
    value: "+",
  }));
  const negativeDrivers = signals.negative.map((text, index) => ({
    id: `negative-${index}`,
    label: "Cần theo dõi",
    description: text,
    value: "!",
  }));
  const rows = [
    ...positiveDrivers.slice(0, 2).map((row) => ({ ...row, positive: true })),
    ...negativeDrivers.slice(0, 1).map((row) => ({ ...row, positive: false })),
  ];
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Tín hiệu gần đây</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Các yếu tố đang tác động đến dự báo
          </p>
        </div>
        <span className="rounded-full bg-badge-warning-background px-2 py-1 text-[11px] font-semibold text-badge-warning-text">
          {rows.length} tín hiệu
        </span>
      </CardHeader>

      <div className="mt-5 space-y-2.5">
        {rows.map((row) => (
          <SignalRow key={row.id} {...row} />
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-badge-warning-background p-3 text-[11px] leading-5 text-badge-warning-text">
        <InfoTriangle
          size={14}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <span>{signals.primaryRisk ?? "Chưa ghi nhận rủi ro nổi bật."}</span>
      </div>

      <Link
        href="/director/ai/next-best-action"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
      >
        Xem AI giải thích
        <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </Card>
  );
}

function SignalRow({
  label,
  description,
  value,
  positive = false,
}: {
  label: string;
  description: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl bg-card-background p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`mt-1 size-2 shrink-0 rounded-full ${positive ? "bg-success-500" : "bg-error-500"}`}
            aria-hidden="true"
          />
          <span className="truncate text-xs font-semibold text-text-secondary">
            {label}
          </span>
        </span>
        <span
          className={`shrink-0 text-xs font-semibold ${positive ? "text-success-500" : "text-error-500"}`}
        >
          {value}
        </span>
      </div>
      <p className="mt-1 pl-4 text-[11px] leading-4 text-text-tertiary">
        {description}
      </p>
    </div>
  );
}
