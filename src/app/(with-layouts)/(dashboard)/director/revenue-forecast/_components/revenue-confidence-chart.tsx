"use client";

import { ArrowUpward } from "@tailgrids/icons";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import RevenueChartTooltip from "./chart-tooltip";

const CONFIDENCE_TREND = [
  { label: "T3", value: 68 },
  { label: "T4", value: 70 },
  { label: "T5", value: 74 },
  { label: "T6", value: 73 },
  { label: "T7", value: 76 },
  { label: "T8", value: 72 },
];

export default function RevenueConfidenceChart() {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Độ tin cậy dự báo</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Mức ổn định của mô hình theo kỳ</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-badge-success-background px-2 py-1 text-[11px] font-semibold text-badge-success-text">
          <ArrowUpward size={11} aria-hidden="true" />
          +4.2%
        </span>
      </CardHeader>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-text-tertiary">Hiện tại</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-1px] text-text-primary">72%</p>
        </div>
        <p className="max-w-28 text-right text-[11px] leading-4 text-text-tertiary">Dữ liệu đủ ổn định để ra quyết định</p>
      </div>

      <div className="mt-3 h-36 w-full" aria-label="Biểu đồ độ tin cậy dự báo theo kỳ">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <AreaChart data={CONFIDENCE_TREND} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue-confidence-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} dy={8} />
            <YAxis hide domain={[60, 80]} />
            <Tooltip content={<RevenueChartTooltip valueSuffix="%" />} cursor={{ stroke: "var(--text-tertiary)", strokeDasharray: "4 4" }} />
            <Area type="monotone" dataKey="value" name="Độ tin cậy" stroke="var(--success-500)" strokeWidth={2.5} fill="url(#revenue-confidence-fill)" dot={{ r: 2.5, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }} isAnimationActive={false} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4 text-[11px]">
        <span className="text-text-tertiary">Đỉnh tin cậy</span>
        <span className="font-semibold text-success-500">T7 · 76%</span>
      </div>
    </Card>
  );
}
