"use client";

import { ArrowUpward } from "@tailgrids/icons";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import RevenueChartTooltip from "./chart-tooltip";

const REVENUE_PULSE = [
  { label: "T3", value: 46 },
  { label: "T4", value: 54 },
  { label: "T5", value: 55 },
  { label: "T6", value: 51 },
  { label: "T7", value: 50 },
  { label: "T8", value: 40 },
];

export default function RevenuePulseChart() {
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Nhịp doanh thu</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Doanh thu theo 6 kỳ gần nhất</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-badge-success-background px-2 py-1 text-[11px] font-semibold text-badge-success-text">
          <ArrowUpward size={11} aria-hidden="true" />
          8.1%
        </span>
      </CardHeader>

      <div className="mt-4 h-36 w-full" aria-label="Biểu đồ nhịp doanh thu theo kỳ">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <BarChart data={REVENUE_PULSE} margin={{ top: 6, right: 0, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} dy={8} />
            <YAxis hide domain={[0, 60]} />
            <Tooltip content={<RevenueChartTooltip valueSuffix="B" />} cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }} />
            <Bar dataKey="value" name="Doanh thu" fill="var(--brand-500)" radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4 text-[11px]">
        <span className="text-text-tertiary">Kỳ cao nhất</span>
        <span className="font-semibold text-text-primary">T5 · 55B</span>
      </div>
    </Card>
  );
}
