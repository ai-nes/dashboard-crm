"use client";

import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { CompletedFieldActivity } from "@/services/api/director-school-field-activity";

import ActivityChartTooltip from "./activity-chart-tooltip";

interface ActivityPerformanceChartProps {
  activities: CompletedFieldActivity[];
}

export default function ActivityPerformanceChart({ activities }: ActivityPerformanceChartProps) {
  const chartData = activities.map((activity) => ({
    name: activity.shortName,
    leads: activity.leads ?? undefined,
    enrolled: activity.enrolled ?? undefined,
  }));

  return (
    <Card className="flex h-full min-w-0 flex-col p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Hồ sơ và nhập học của 5 trường gần nhất</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh số hồ sơ thu được với số học sinh đã nhập học.</p>
        </div>
        <span className="text-xs text-text-tertiary">{activities.length} hoạt động đã kết thúc</span>
      </CardHeader>

      <div className="min-h-[420px] w-full min-w-0 flex-1">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }} barCategoryGap="22%">
            <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={122} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
            <Tooltip content={<ActivityChartTooltip />} cursor={{ fill: "var(--background-soft-50)" }} />
            <Legend verticalAlign="top" align="right" height={28} iconType="circle" wrapperStyle={{ color: "var(--text-secondary)", fontSize: 11 }} />
            <Bar name="Hồ sơ thu được" dataKey="leads" fill="var(--primary-300)" radius={[0, 5, 5, 0]} barSize={12} />
            <Bar name="Học sinh nhập học" dataKey="enrolled" fill="var(--success-500)" radius={[0, 5, 5, 0]} barSize={12} />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
