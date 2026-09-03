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
    return <ChannelTooltip channel={rawData} />;
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

function ChannelTooltip({ channel }: { channel: ChannelChartItem }) {
  const activities = channel.activities ?? [];
  const previewActivities = activities.slice(0, 2);

  return (
    <div className="pointer-events-none z-50 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-card-border bg-card-background/95 p-3 text-xs shadow-md backdrop-blur-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: channel.fill || "var(--primary-500)" }}
            aria-hidden="true"
          />
          <span className="truncate font-semibold text-text-primary" title={channel.channel}>
            {channel.channel}
          </span>
        </div>
        <span className="shrink-0 font-bold text-text-primary">{channel.touches} lượt</span>
      </div>

      {(channel.response != null || activities.length > 0) && (
        <div className="mt-2 flex items-center gap-3 border-t border-card-border/40 pt-2 text-[11px] text-text-secondary">
          {channel.response != null && (
            <span>
              Phản hồi <strong className="font-semibold text-text-primary">{channel.response}%</strong>
            </span>
          )}
          {activities.length > 0 && (
            <span>
              <strong className="font-semibold text-text-primary">{activities.length}</strong> ghi nhận
            </span>
          )}
        </div>
      )}

      {previewActivities.length > 0 && (
        <div className="mt-2 border-t border-card-border/40 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
            Điểm chạm gần đây
          </p>
          <ul className="mt-1.5 space-y-2">
            {previewActivities.map((activity) => (
              <li key={`${activity.title}-${activity.time ?? ""}`} className="min-w-0">
                <p className="truncate font-medium text-text-primary" title={activity.title}>
                  {activity.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-text-secondary">
                  {[activity.time, activity.description].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
          {activities.length > previewActivities.length && (
            <p className="mt-1.5 text-[10px] text-text-tertiary">
              +{activities.length - previewActivities.length} ghi nhận khác
            </p>
          )}
        </div>
      )}

      {channel.effectiveness && (
        <p className="mt-2 border-t border-card-border/40 pt-2 text-[11px] text-text-secondary">
          Hiệu quả: <span className="font-medium text-text-primary">{channel.effectiveness}</span>
        </p>
      )}

      {channel.notes && (
        <p className="mt-1 text-[11px] leading-4 text-text-secondary">{channel.notes}</p>
      )}

    </div>
  );
}
