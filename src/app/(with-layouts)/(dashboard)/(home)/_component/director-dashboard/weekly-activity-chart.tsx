"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { ArrowUpward } from "@tailgrids/icons";
import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import DirectorChartTooltip from "./chart-tooltip";
import { initialWeeklyActivity } from "@/services/api/director-overview/data";
import type { WeeklyActivity } from "./types";

interface WeeklyActivityChartProps {
  weeklyActivity?: WeeklyActivity;
}

export default function WeeklyActivityChart({ weeklyActivity = initialWeeklyActivity }: WeeklyActivityChartProps) {
  const data = weeklyActivity ?? initialWeeklyActivity;
  const points = data.points ?? [];
  const totalInteractions = Number.isFinite(data.totalInteractions) ? data.totalInteractions : 0;
  const averageSla = Number.isFinite(data.averageSla) ? data.averageSla : 0;
  const changePercent = Number.isFinite(data.changePercent) ? data.changePercent : 0;

  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Nhịp vận hành tư vấn</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tương tác và SLA trong 7 ngày gần nhất</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-semibold text-badge-success-text">
          <ArrowUpward size={13} aria-hidden="true" />
          {changePercent}%
        </span>
      </CardHeader>

      <div className="mb-4 flex items-center gap-6 border-b border-card-border pb-4 text-xs">
        <span className="flex items-center gap-2 text-text-secondary">
          <span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
          Tương tác tư vấn
          <strong className="text-text-primary">{totalInteractions.toLocaleString("vi-VN")}</strong>
        </span>
        <span className="flex items-center gap-2 text-text-secondary">
          <span className="size-2 rounded-full bg-success-500" aria-hidden="true" />
          SLA trung bình
          <strong className="text-text-primary">{averageSla.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%</strong>
        </span>
      </div>

      <div className="h-72 w-full" aria-label="Biểu đồ nhịp vận hành tư vấn">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={points} margin={{ top: 4, right: -4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              yAxisId="interactions"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : value.toString())}
            />
            <YAxis yAxisId="sla" orientation="right" domain={[80, 100]} hide />
            <Tooltip content={<DirectorChartTooltip />} cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }} />
            <Bar
              yAxisId="interactions"
              dataKey="interactions"
              name="Tương tác tư vấn"
              fill="var(--brand-500)"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              isAnimationActive={false}
            />
            <Line
              yAxisId="sla"
              type="monotone"
              dataKey="sla"
              name="SLA"
              stroke="var(--success-500)"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={{ r: 3, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
