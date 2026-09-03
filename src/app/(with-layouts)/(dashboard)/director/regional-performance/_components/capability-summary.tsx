"use client";

import { memo } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { CapabilityColumn } from "./types";
import type { HealthTone, RegionPerformance } from "./types";

const toneClass: Record<HealthTone, string> = {
  good: "bg-success-500",
  watch: "bg-warning-500",
  critical: "bg-error-500",
};
const toneLabel: Record<HealthTone, string> = {
  good: "Tốt",
  watch: "Theo dõi",
  critical: "Can thiệp",
};
const toneTextClass: Record<HealthTone, string> = {
  good: "text-success-500",
  watch: "text-warning-500",
  critical: "text-error-500",
};

function CapabilitySummary({
  province,
  capabilityColumns,
}: {
  province: RegionPerformance;
  capabilityColumns: CapabilityColumn[];
}) {
  const capacityTone: HealthTone =
    (province.capacity ?? 0) > 90
      ? "critical"
      : (province.capacity ?? 0) > 80
        ? "watch"
        : "good";

  return (
    <Card className="p-5">
      <CardHeader className="mb-4">
        <div>
          <CardTitle>Mức sử dụng đội ngũ</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            Đội ngũ đang xử lý hồ sơ tại {province.name}.
          </p>
        </div>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background-soft-50 p-3">
          <p className="text-xs text-text-tertiary">Đang phụ trách</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {province.activeAdvisors ?? "—"} người
          </p>
        </div>
        <div className="rounded-lg bg-background-soft-50 p-3">
          <p className="text-xs text-text-tertiary">Mức sử dụng</p>
          <p
            className={
              "mt-1 text-lg font-semibold " + toneTextClass[capacityTone]
            }
          >
            {province.capacity ?? "—"}%
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-text-secondary">Công suất đang dùng</span>
          <span className={"font-semibold " + toneTextClass[capacityTone]}>
            {province.capacity ?? "—"}%
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-background-soft-50"
          aria-hidden="true"
        >
          <div
            className={"h-full rounded-full " + toneClass[capacityTone]}
            style={{
              width: String(Math.min(100, province.capacity ?? 0)) + "%",
            }}
          />
        </div>
      </div>
      <div className="mt-5 border-t border-card-border/70 pt-4">
        <p className="mb-3 text-xs font-semibold text-text-primary">
          Tình trạng theo khâu
        </p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {capabilityColumns.map((column) => {
            const tone = province.capabilities[column.key];
            return (
              <div
                key={column.key}
                className="flex items-center justify-between gap-3 border-b border-card-border/70 pb-2.5 text-xs"
              >
                <span className="text-text-secondary">{column.label}</span>
                <span className="inline-flex items-center gap-1.5 text-text-secondary">
                  <i
                    aria-hidden="true"
                    className={"size-2 rounded-full " + toneClass[tone]}
                  />
                  {toneLabel[tone]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default memo(CapabilitySummary);
