"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LeadSaleTrendPoint } from "./lead-sale-dashboard.types";
import TrendTooltip from "./trend-tooltip";

interface PerformanceTrendProps {
  data: LeadSaleTrendPoint[];
}

export default function PerformanceTrend({ data }: PerformanceTrendProps) {
  const currentPoint = data.at(-1);
  const onPlanWeeks = data.filter((point) => point.enrollment >= point.target).length;
  const currentGap = currentPoint
    ? currentPoint.target - currentPoint.enrollment
    : 0;

  return (
    <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Xu hướng nhập học</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            So sánh số đã nhập học với mức cần đạt cộng dồn theo từng tuần.
          </p>
        </div>
        <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-semibold text-text-secondary">
          8 tuần gần nhất
        </span>
      </CardHeader>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-tertiary">
        <LegendLine color="var(--primary-500)" label="Nhập học" />
        <LegendLine color="var(--warning-500)" label="Kế hoạch" />
        <LegendLine color="var(--success-500)" label="Cơ hội mới" />
      </div>

      <div
        className="mt-2 h-[290px] w-full sm:h-[340px]"
        aria-label="Biểu đồ nhập học thực tế so với kế hoạch lũy kế theo tuần"
      >
        <ChartContainer
          className="h-full w-full"
          height="100%"
          width="100%"
          minWidth={0}
          minHeight={0}
        >
          <ComposedChart
            data={data}
            margin={{ top: 14, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="lead-sale-enrollment-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-500)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-500)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="enrollment"
              name="Nhập học thực tế"
              stroke="var(--primary-500)"
              strokeWidth={3}
              fill="url(#lead-sale-enrollment-fill)"
              dot={{
                r: 3.5,
                fill: "var(--primary-500)",
                stroke: "var(--card-background)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--primary-500)",
                stroke: "var(--card-background)",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Kế hoạch lũy kế"
              stroke="var(--warning-500)"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "var(--warning-500)",
                stroke: "var(--card-background)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: "var(--warning-500)",
                stroke: "var(--card-background)",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="newOpportunities"
              name="Cơ hội mới"
              stroke="var(--success-500)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{
                r: 2.5,
                fill: "var(--success-500)",
                stroke: "var(--card-background)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: "var(--success-500)",
                stroke: "var(--card-background)",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>

      <div className="mt-4 grid gap-3 border-t border-card-border pt-4 md:grid-cols-3">
        <TrendFact label="Số tuần đạt kế hoạch" value={`${onPlanWeeks}/${data.length}`} />
        <TrendFact
          label="Chênh lệch hiện tại"
          value={
            currentGap > 0
              ? `Thiếu ${currentGap}`
              : currentGap < 0
                ? `Vượt ${Math.abs(currentGap)}`
                : "Đang đạt"
          }
        />
        <TrendFact
          label="Cơ hội mới tuần này"
          value={String(currentPoint?.newOpportunities ?? 0)}
        />
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
