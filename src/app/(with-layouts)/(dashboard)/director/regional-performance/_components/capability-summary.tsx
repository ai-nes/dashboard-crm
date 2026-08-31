"use client";

import { memo } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { capabilityColumns } from "./data";
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

function CapabilitySummary({ province }: { province: RegionPerformance }) {
  return (
    <Card className="p-5">
      <CardHeader className="mb-4">
        <div>
          <CardTitle>Năng lực theo khâu</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            {province.name} · chỉ hiển thị tỉnh đang chọn.
          </p>
        </div>
      </CardHeader>
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
                  className={`size-2 rounded-full ${toneClass[tone]}`}
                />
                {toneLabel[tone]}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default memo(CapabilitySummary);
