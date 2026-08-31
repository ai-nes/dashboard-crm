"use client";

import type { TooltipContentProps } from "recharts";

interface OverviewTooltipProps extends Partial<TooltipContentProps<number, string>> {
  suffix?: string;
}

export default function OverviewTooltip({ active, label, payload, suffix = "" }: OverviewTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-text-primary">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((item, index) => (
          <div key={`${item.dataKey?.toString() ?? "value"}-${index}`} className="flex items-center justify-between gap-5 text-xs">
            <span className="text-text-secondary">{item.name}</span>
            <strong className="text-text-primary">{formatTooltipValue(item.value, suffix)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTooltipValue(value: unknown, suffix: string): string {
  if (value == null || value === "") return "—";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toLocaleString("vi-VN")}${suffix}`;
  }
  return `${String(value)}${suffix}`;
}
