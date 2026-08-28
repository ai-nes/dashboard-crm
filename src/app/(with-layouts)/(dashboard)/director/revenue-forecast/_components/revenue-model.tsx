"use client";

import { ArrowDownward, CheckCircle1 } from "@tailgrids/icons";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import RevenueChartTooltip from "./chart-tooltip";
import { revenueModel } from "./data";
import type { RevenueMetricTone } from "./types";

const TONE_STYLES: Record<RevenueMetricTone, { dot: string; text: string }> = {
  primary: { dot: "bg-brand-500", text: "text-brand-500" },
  info: { dot: "bg-info-500", text: "text-info-500" },
  success: { dot: "bg-success-500", text: "text-success-500" },
  warning: { dot: "bg-warning-500", text: "text-warning-500" },
  danger: { dot: "bg-error-500", text: "text-error-500" },
};

const MODEL_DONUT = [
  { id: "net", label: "Doanh thu thuần", value: 468, color: "var(--brand-500)" },
  { id: "reductions", label: "Học bổng & chiết khấu", value: 52, color: "var(--warning-500)" },
];

export default function RevenueModel() {
  return (
    <Card className="flex min-w-0 flex-col bg-background-gray-primary">
      <CardHeader className="mb-1 items-start">
        <div>
          <CardTitle>Mô hình doanh thu</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Biên doanh thu sau học bổng và chiết khấu</p>
        </div>
        <span className="rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-semibold text-badge-success-text">90% chỉ tiêu</span>
      </CardHeader>

      <div className="relative h-52">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Tooltip content={<RevenueChartTooltip valueSuffix="B" />} />
            <Pie
              data={MODEL_DONUT}
              dataKey="value"
              nameKey="label"
              innerRadius="66%"
              outerRadius="90%"
              paddingAngle={3}
              stroke="var(--card-background)"
              strokeWidth={4}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {MODEL_DONUT.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-[-1px] text-text-primary">468B</span>
          <span className="mt-1 text-[11px] text-text-tertiary">doanh thu thuần</span>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-center gap-5 text-[11px] text-text-tertiary">
        {MODEL_DONUT.map((item) => (
          <span key={item.id} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>

      <div className="flex-1 space-y-3 border-t border-card-border pt-4">
        {revenueModel.slice(0, 3).map((item) => {
          const tone = TONE_STYLES[item.tone];

          return (
            <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-text-secondary">
                <span className={`size-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              <span className={`flex shrink-0 items-center gap-1 font-semibold ${tone.text}`}>
                {item.id !== "tuition" && <ArrowDownward size={12} aria-hidden="true" />}
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-card-border pt-4 text-xs text-badge-success-text">
        <CheckCircle1 size={15} aria-hidden="true" />
        <span>Biên thuần dự báo đang trong ngưỡng an toàn.</span>
      </div>
    </Card>
  );
}
