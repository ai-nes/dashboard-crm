"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import RevenueChartTooltip from "./chart-tooltip";

const CASHFLOW = [
  { label: "T3", gross: 48, reductions: 5 },
  { label: "T4", gross: 58, reductions: 6 },
  { label: "T5", gross: 61, reductions: 7 },
  { label: "T6", gross: 57, reductions: 6 },
  { label: "T7", gross: 55, reductions: 6 },
  { label: "T8", gross: 46, reductions: 5 },
];

export default function RevenueCashflowChart() {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Thu thực tế & giảm trừ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh dòng tiền vào với học bổng và chiết khấu</p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-[11px] font-semibold text-badge-primary-text">Đơn vị: tỷ đồng</span>
      </CardHeader>

      <div className="mt-4 grid grid-cols-3 gap-3 border-b border-card-border pb-4">
        <CashflowSummary label="Tổng thu" value="325B" />
        <CashflowSummary label="Giảm trừ" value="35B" tone="text-badge-warning-text" />
        <CashflowSummary label="Thuần" value="290B" tone="text-success-500" />
      </div>

      <div className="mt-4 h-[250px] w-full" aria-label="Biểu đồ thu thực tế và giảm trừ theo kỳ">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <BarChart data={CASHFLOW} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barGap={5}>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} dy={9} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value: number) => `${value}B`} />
            <Tooltip content={<RevenueChartTooltip valueSuffix="B" />} cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }} />
            <Bar dataKey="gross" name="Tổng thu" fill="var(--brand-500)" radius={[5, 5, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            <Bar dataKey="reductions" name="Giảm trừ" fill="var(--warning-500)" radius={[5, 5, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-card-border pt-4 text-[11px] text-text-tertiary">
        <LegendItem label="Tổng thu" className="bg-brand-500" />
        <LegendItem label="Giảm trừ" className="bg-warning-500" />
        <span className="ml-auto font-semibold text-success-500">Thuần +8.1%</span>
      </div>
    </Card>
  );
}

function CashflowSummary({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-base font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function LegendItem({ label, className }: { label: string; className: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${className}`} aria-hidden="true" />
      {label}
    </span>
  );
}
