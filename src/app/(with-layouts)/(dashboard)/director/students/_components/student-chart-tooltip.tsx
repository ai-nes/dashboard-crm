"use client";

import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { ChannelChartItem, TrendChartItem } from "./student-chart-types";

export default function StudentChartTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const firstItem = payload[0];
  const rawData = (firstItem?.payload || {}) as ChannelChartItem & TrendChartItem;

  // 1. Kênh tương tác (Channel Bar Chart)
  if (rawData.channel && rawData.touches != null) {
    return (
      <div className="pointer-events-none z-50 min-w-44 max-w-56 rounded-lg border border-card-border bg-card-background/95 p-2.5 text-xs shadow-md backdrop-blur-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: rawData.fill || "var(--primary-500)" }}
              aria-hidden="true"
            />
            <span className="font-semibold text-text-primary truncate">
              {rawData.channel}
            </span>
          </div>
          <span className="font-bold text-text-primary shrink-0">
            {rawData.touches} lượt
          </span>
        </div>

        {rawData.response != null && (
          <div className="mt-1 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Phản hồi:</span>
            <span className="font-medium text-text-primary">{rawData.response}%</span>
          </div>
        )}

        <div className="mt-1.5 border-t border-card-border/40 pt-1 text-[10px] font-medium text-primary-500">
          Nhấp để mở chi tiết bên hông →
        </div>
      </div>
    );
  }

  // 2. Khả năng nhập học (Probability Trend Area Chart)
  if (rawData.score != null) {
    const score = Number(rawData.score);
    return (
      <div className="pointer-events-none z-50 min-w-44 max-w-56 rounded-lg border border-card-border bg-card-background/95 p-2.5 text-xs shadow-md backdrop-blur-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-text-primary">{rawData.date || label}</span>
          <span className="font-bold text-success-500">{score}%</span>
        </div>

        {rawData.eventTitle && (
          <p className="mt-1 text-[11px] text-text-secondary line-clamp-1">
            {rawData.eventTitle}
          </p>
        )}

        <div className="mt-1.5 border-t border-card-border/40 pt-1 text-[10px] font-medium text-primary-500">
          Nhấp để mở chi tiết bên hông →
        </div>
      </div>
    );
  }

  // Fallback mặc định
  return (
    <div className="min-w-36 rounded-lg border border-card-border bg-card-background p-2.5 shadow-md">
      <p className="mb-1 text-xs font-semibold text-text-primary">{label}</p>
      <div className="space-y-1 text-xs">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="text-text-secondary">{item.name}</span>
            <span className="font-semibold text-text-primary">{item.value ?? "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
