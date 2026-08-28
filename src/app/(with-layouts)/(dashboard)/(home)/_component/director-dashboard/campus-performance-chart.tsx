"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import DirectorChartTooltip from "./chart-tooltip";
import { campusPerformanceChart } from "./data";

const LEGEND = [
  { label: "Hồ sơ tiềm năng", color: "bg-brand-500" },
  { label: "Đã nộp hồ sơ", color: "bg-primary-300" },
  { label: "Đã nhập học", color: "bg-success-500" },
];

export default function CampusPerformanceChart() {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Hiệu suất theo khu vực</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh quy mô phễu và kết quả đầu ra</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
              <span className={`size-2 rounded-full ${item.color}`} aria-hidden="true" />
              {item.label}
            </span>
          ))}
        </div>
      </CardHeader>

      <div className="min-h-72 w-full flex-1 sm:min-h-80" aria-label="Biểu đồ hiệu suất theo khu vực">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <BarChart data={campusPerformanceChart} margin={{ top: 4, right: 0, left: -18, bottom: 0 }} barGap={5}>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : value.toString())}
            />
            <Tooltip
              cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }}
              content={<DirectorChartTooltip />}
            />
            <Bar dataKey="activeRecords" name="Hồ sơ tiềm năng" fill="var(--brand-500)" radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
            <Bar dataKey="applicants" name="Đã nộp hồ sơ" fill="var(--primary-300)" radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
            <Bar dataKey="enrolled" name="Đã nhập học" fill="var(--success-500)" radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
