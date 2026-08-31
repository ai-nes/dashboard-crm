"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import ActionOutcomeTooltip from "./action-outcome-tooltip";
import { actionOutcomes } from "./data";

export default function ActionOutcomeChart() {
  const chartData = [...actionOutcomes].sort((a, b) => b.transitionRate - a.transitionRate);

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Hiệu quả từng loại việc</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ hồ sơ sang bước tiếp theo sau khi thực hiện · 30 ngày gần nhất.</p>
        </div>
        <Badge color="primary">{chartData.length} loại việc</Badge>
      </CardHeader>

      <div className="h-72 w-full" role="img" aria-label="Biểu đồ hiệu quả từng loại việc, tính theo tỷ lệ hồ sơ sang bước tiếp theo">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 42, bottom: 4, left: 4 }} barCategoryGap={12}>
            <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={136} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <Tooltip content={<ActionOutcomeTooltip />} cursor={{ fill: "var(--background-soft-50)" }} />
            <Bar dataKey="transitionRate" name="Tỷ lệ hồ sơ sang bước tiếp theo" fill="var(--primary-500)" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={false}>
              <LabelList dataKey="transitionRate" position="right" formatter={(value) => `${value}%`} fill="var(--text-secondary)" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
