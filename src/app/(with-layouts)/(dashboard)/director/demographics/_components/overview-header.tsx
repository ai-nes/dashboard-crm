"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DirectorDemographicsOverviewMeta } from "@/services/api/demographics/types";

interface OverviewHeaderProps {
  meta?: DirectorDemographicsOverviewMeta;
  filterControl?: ReactNode;
}

export default function OverviewHeader({
  meta,
  filterControl,
}: OverviewHeaderProps) {
  const periodLabel = getPeriodLabel(meta?.period);
  const snapshotLabel = meta
    ? `Mùa tuyển sinh ${meta.admissionYear} · ${periodLabel}`
    : "Dữ liệu minh họa";
  const scopeLabel = meta?.scope && meta.scope !== "all" ? meta.scope : "Toàn quốc";

  return (
    <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">Phân tích học sinh</Badge>
          <span className="text-xs text-text-tertiary">{snapshotLabel}</span>
          {meta?.asOf ? <span className="text-xs text-text-tertiary">· Cập nhật {formatAsOf(meta.asOf)}</span> : null}
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Tổng quan nhóm học sinh
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Biết nhóm nào đáng ưu tiên, nguồn nào tạo học sinh hợp lệ và việc cần làm tiếp theo.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-medium text-text-secondary">
          {scopeLabel}
        </span>
        {filterControl}
      </div>
    </header>
  );
}

function getPeriodLabel(period?: string): string {
  if (period === "season") return "cả mùa";
  if (period === "12m") return "12 tháng gần nhất";
  if (period === "6m") return "6 tháng gần nhất";
  return period || "cả mùa";
}

function formatAsOf(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
