"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import type { LeadSaleTrendPoint } from "./lead-sale-dashboard.types";
import TrendTooltip from "./trend-tooltip";

const TREND_STAGES = [
  { id: "new", label: "Lead mới", color: "var(--primary-500)" },
  { id: "attempting", label: "Đang liên hệ", color: "var(--warning-500)" },
  { id: "connected", label: "Đã kết nối", color: "var(--badge-violet-text)" },
  { id: "qualified", label: "Đủ điều kiện", color: "var(--success-500)" },
] as const;

interface PerformanceTrendProps {
  data: LeadSaleTrendPoint[];
}

export default function PerformanceTrend({ data }: PerformanceTrendProps) {
  const currentStageCounts = data.at(-1)?.stageCounts ?? {
    new: 0,
    attempting: 0,
    connected: 0,
    qualified: 0,
  };

  return (
    <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Xu hướng trạng thái tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Số hồ sơ ghi nhận theo các trạng thái core trong từng tuần.
          </p>
        </div>
        <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-semibold text-text-secondary">
          {data.length} tuần gần nhất
        </span>
      </CardHeader>

      <div
        className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-tertiary"
        aria-label="Chú thích biểu đồ trạng thái tuyển sinh"
      >
        {TREND_STAGES.map((stage) => (
          <LegendLine key={stage.id} color={stage.color} label={stage.label} />
        ))}
      </div>

      <div
        className="mt-2 h-[290px] w-full sm:h-[340px]"
        role="img"
        aria-label="Biểu đồ trạng thái tuyển sinh theo tuần"
      >
        <ChartContainer
          className="h-full w-full"
          height="100%"
          width="100%"
          minWidth={0}
          minHeight={0}
        >
          <LineChart data={data} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border-color-base-100)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{
                stroke: "var(--border-color-base-300)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={<TrendTooltip />}
            />
            {TREND_STAGES.map((stage) => (
              <Line
                key={stage.id}
                type="monotone"
                dataKey={`stageCounts.${stage.id}`}
                name={stage.label}
                stroke={stage.color}
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: stage.color,
                  stroke: "var(--card-background)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: stage.color,
                  stroke: "var(--card-background)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>

      <div className="mt-4 grid gap-3 border-t border-card-border pt-4 md:grid-cols-3">
        <TrendFact label="Lead mới tuần này" value={String(currentStageCounts.new)} />
        <TrendFact label="Đang liên hệ tuần này" value={String(currentStageCounts.attempting)} />
        <TrendFact label="Đủ điều kiện tuần này" value={String(currentStageCounts.qualified)} />
      </div>
    </Card>
  );
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-0.5 w-5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function TrendFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background-soft-50 px-4 py-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
