"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { ArrowUpward } from "@tailgrids/icons";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import RevenueChartTooltip from "./chart-tooltip";
import { revenueForecast } from "./data";

export default function RevenueForecastChart() {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Dự báo doanh thu theo kỳ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Doanh thu thực tế, dự báo AI và chỉ tiêu niên khóa</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-semibold text-badge-success-text">
          <ArrowUpward size={13} aria-hidden="true" />
          +11.5% so với kỳ trước
        </span>
      </CardHeader>

      <div className="relative h-[280px] w-full sm:h-[320px] xl:h-[360px]" aria-label="Biểu đồ dự báo doanh thu theo niên khóa">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={revenueForecast} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue-forecast-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceArea x1="T8" x2="T10" fill="var(--brand-500)" fillOpacity={0.04} strokeOpacity={0} />
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              tickFormatter={(value: number) => `${value}B`}
            />
            <Tooltip
              cursor={{ stroke: "var(--text-tertiary)", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={<RevenueChartTooltip valueSuffix="B" />}
            />
            <ReferenceLine x="T8" stroke="var(--brand-500)" strokeDasharray="3 5" strokeOpacity={0.7} />
            <Area
              type="monotone"
              dataKey="actual"
              name="Thực tế"
              stroke="var(--brand-500)"
              strokeWidth={2.5}
              fill="url(#revenue-forecast-fill)"
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
              connectNulls={false}
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
        <LegendItem label="Thực tế" className="bg-brand-500" />
        <LegendItem label="Dự báo AI" className="border-t border-dashed border-brand-500" />
        <LegendItem label="Chỉ tiêu" className="border-t border-dashed border-text-tertiary" />
      </div>
    </Card>
  );
}

function LegendItem({ label, className }: { label: string; className: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-0.5 w-4 ${className}`} aria-hidden="true" />
      {label}
    </span>
  );
}
