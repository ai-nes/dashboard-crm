"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { ArrowUpward } from "@tailgrids/icons";
import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import DirectorChartTooltip from "./chart-tooltip";
import { enrollmentForecast } from "./data";

export default function EnrollmentForecast() {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-card-background">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Dự báo nhập học</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Khoảng cách giữa kết quả hiện tại, dự báo AI và chỉ tiêu
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-semibold text-badge-success-text">
          <ArrowUpward size={13} aria-hidden="true" />
          Tin cậy 72%
        </span>
      </CardHeader>

      <div className="mb-4 grid grid-cols-3 gap-3 border-b border-card-border pb-4">
        <ForecastSummary label="Hiện tại" value="3.820" tone="text-text-primary" />
        <ForecastSummary label="Dự báo" value="4.680" tone="text-brand-500" />
        <ForecastSummary label="Chỉ tiêu" value="5.000" tone="text-text-primary" />
      </div>

      <div className="min-h-72 w-full flex-1" aria-label="Biểu đồ dự báo nhập học theo niên khóa">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={enrollmentForecast} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="director-forecast-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : value.toString())}
            />
            <Tooltip
              cursor={{ stroke: "var(--text-tertiary)", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={<DirectorChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Thực tế"
              stroke="var(--brand-500)"
              strokeWidth={2.5}
              fill="url(#director-forecast-fill)"
              connectNulls={false}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Dự báo AI"
              stroke="var(--brand-500)"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              dot={{ r: 3, fill: "var(--brand-500)", stroke: "var(--card-background)", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--brand-500)", stroke: "var(--card-background)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Chỉ tiêu"
              stroke="var(--text-tertiary)"
              strokeWidth={1.5}
              strokeDasharray="3 5"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-tertiary">
        <LegendItem label="Thực tế" color="bg-brand-500" />
        <LegendItem label="Dự báo AI" color="bg-brand-500" dashed />
        <LegendItem label="Chỉ tiêu" color="bg-text-tertiary" dashed />
      </div>
    </Card>
  );
}

function ForecastSummary({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-text-tertiary">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-[-0.5px] ${tone}`}>{value}</p>
    </div>
  );
}

function LegendItem({ label, color, dashed = false }: { label: string; color: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-0.5 w-4 ${dashed ? "border-t border-dashed" : color}`} aria-hidden="true" />
      {label}
    </span>
  );
}
