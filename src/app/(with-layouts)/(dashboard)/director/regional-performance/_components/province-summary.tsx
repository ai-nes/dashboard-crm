"use client";

import { memo } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { HealthTone, RegionPerformance } from "./types";

const toneLabel: Record<HealthTone, string> = {
  good: "Tốt",
  watch: "Cần theo dõi",
  critical: "Cần can thiệp",
};
const numberFormatter = new Intl.NumberFormat("vi-VN");

function ProvinceSummary({ province }: { province: RegionPerformance }) {
  return (
    <Card className="p-5">
      <CardHeader className="mb-5">
        <div>
          <CardTitle>{province.name}</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            Tổng quan hiệu suất tuyển sinh trong kỳ 2026.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-medium text-text-secondary">
          <i
            aria-hidden="true"
            className={`size-2 rounded-full ${province.health === "good" ? "bg-success-500" : province.health === "watch" ? "bg-warning-500" : "bg-error-500"}`}
          />
          {toneLabel[province.health]}
        </span>
      </CardHeader>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric
          label="Hồ sơ đăng ký"
          value={numberFormatter.format(province.applications)}
          change={province.applicationChange}
        />
        <Metric
          label="Nhập học"
          value={numberFormatter.format(province.enrollments)}
          change={province.enrollmentChange}
        />
        <Metric
          label="Tỷ lệ chuyển đổi nhập học"
          value={`${province.conversion}%`}
        />
        <Metric
          label="Sức tải đội ngũ"
          value={`${province.capacity}%`}
          tone={
            province.capacity > 90
              ? "critical"
              : province.capacity > 80
                ? "watch"
                : "good"
          }
        />
      </div>
      <div className="mt-5 border-t border-card-border pt-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-text-tertiary">Đạt chỉ tiêu</span>
          <span className="font-semibold text-text-primary">
            {province.targetAchievement}%
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-background-soft-100"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${province.targetAchievement}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  change,
  tone,
}: {
  label: string;
  value: string;
  change?: number;
  tone?: HealthTone;
}) {
  const isPositive = change === undefined || change >= 0;
  const toneClass =
    tone === "critical"
      ? "text-error-500"
      : tone === "watch"
        ? "text-warning-500"
        : tone === "good"
          ? "text-success-500"
          : "text-text-primary";

  return (
    <div>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</p>
      {change !== undefined && (
        <p
          className={`mt-1 text-xs font-medium ${isPositive ? "text-success-500" : "text-error-500"}`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(change)}% so với kỳ trước
        </p>
      )}
    </div>
  );
}

export default memo(ProvinceSummary);
