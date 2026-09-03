import {
  ArrowRight,
  ArrowUpward,
  CheckCircle1,
  InfoTriangle,
} from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { positiveDrivers } from "./data";
import { percent, useRevenueForecastData } from "./revenue-forecast-context";

export default function AiForecastExplanation() {
  const { aiExplanation, signals } = useRevenueForecastData();
  const positiveDrivers = aiExplanation.drivers.map((driver, index) => ({
    id: `driver-${index}`,
    label: "Yếu tố mô hình",
    value: "+",
    description: driver,
    tone: "positive" as const,
  }));
  const negativeDrivers = signals.negative.map((driver, index) => ({
    id: `risk-${index}`,
    label: "Cần theo dõi",
    value: "!",
    description: driver,
    tone: "negative" as const,
  }));
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text">
              <CheckCircle1 size={15} aria-hidden="true" />
            </span>
            <CardTitle>AI giải thích dự báo</CardTitle>
          </div>
          <p className="mt-2 text-xs leading-5 text-text-tertiary">
            Tách các yếu tố đang đẩy tăng hoặc kéo giảm kết quả
          </p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">
          Tin cậy {percent(aiExplanation.confidence)}
        </span>
      </CardHeader>

      <div className="mt-5 rounded-2xl border border-card-border bg-card-background p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-badge-success-background text-badge-success-text">
              <ArrowUpward size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Kết luận mô hình
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {aiExplanation.conclusion.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                {aiExplanation.conclusion.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tracking-[-0.7px] text-text-primary">
              {aiExplanation.expectedEnrollment.toLocaleString("vi-VN")}
            </p>
            <p className="mt-1 text-[11px] text-text-tertiary">
              nhập học dự kiến
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Độ tin cậy của mô hình</span>
            <span className="font-semibold text-badge-primary-text">
              {percent(aiExplanation.confidence)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-badge-primary-background">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${aiExplanation.confidence ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DriverGroup
          title="Động lực tăng trưởng"
          drivers={positiveDrivers}
          positive
        />
        <DriverGroup title="Yếu tố cần theo dõi" drivers={negativeDrivers} />
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-start gap-2 rounded-xl bg-badge-warning-background p-3.5 text-xs leading-5 text-badge-warning-text">
          <InfoTriangle
            size={15}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span>
            <strong>Rủi ro chính:</strong>{" "}
            {aiExplanation.primaryRisk ?? "Chưa ghi nhận rủi ro chính."}
          </span>
        </div>

        <Link
          href="/director/ai/next-best-action"
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
        >
          Xem hành động đề xuất
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

function DriverGroup({
  title,
  drivers,
  positive = false,
}: {
  title: string;
  drivers: typeof positiveDrivers;
  positive?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-text-secondary">{title}</p>
        <span
          className={`size-2 rounded-full ${positive ? "bg-success-500" : "bg-error-500"}`}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-2">
        {drivers.map((driver) => {
          const strength = Math.min(
            (Math.abs(Number.parseFloat(driver.value)) / 20) * 100,
            100,
          );

          return (
            <div key={driver.id} className="rounded-xl bg-card-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-text-secondary">
                    {driver.label}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-text-tertiary">
                    {driver.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold ${positive ? "text-success-500" : "text-error-500"}`}
                >
                  {driver.value}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-background-gray-secondary">
                <div
                  className={`h-full rounded-full ${positive ? "bg-success-500" : "bg-error-500"}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
