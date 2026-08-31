"use client";

import { memo, type ReactNode } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { RegionPerformance } from "./types";

function EnrollmentTrend({ province }: { province: RegionPerformance }) {
  return (
    <ChartCard
      title={`Hồ sơ và nhập học theo tháng · ${province.name}`}
      description="6 tháng gần nhất · kỳ này, kỳ trước và nhập học"
      legend={<TrendLegend />}
    >
      <ComposedChart
        data={province.trend}
        margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
        barCategoryGap={18}
      >
        <CartesianGrid
          vertical={false}
          stroke="var(--border-color-base-100)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
        />
        <YAxis
          yAxisId="applications"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
          tickFormatter={(value) => Number(value).toLocaleString("vi-VN")}
        />
        <YAxis
          yAxisId="enrollments"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
          tickFormatter={(value) => Number(value).toLocaleString("vi-VN")}
        />
        <Tooltip content={<TooltipContent />} />
        <Bar
          yAxisId="applications"
          name="Hồ sơ kỳ này"
          dataKey="applications"
          fill="var(--primary-500)"
          radius={[4, 4, 0, 0]}
          barSize={18}
        />
        <Bar
          yAxisId="applications"
          name="Hồ sơ kỳ trước"
          dataKey="previousApplications"
          fill="var(--primary-300)"
          radius={[4, 4, 0, 0]}
          barSize={18}
        />
        <Line
          yAxisId="enrollments"
          name="Nhập học"
          type="monotone"
          dataKey="enrollments"
          stroke="var(--success-500)"
          strokeWidth={2.5}
          dot={false}
        />
      </ComposedChart>
    </ChartCard>
  );
}

function ChartCard({
  title,
  description,
  legend,
  children,
}: {
  title: string;
  description: string;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">{description}</p>
        </div>
      </CardHeader>
      {legend && <div className="mb-2">{legend}</div>}
      <div className="h-72 min-h-72 w-full">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          {children}
        </ChartContainer>
      </div>
    </Card>
  );
}

function TrendLegend() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="size-2 rounded-full bg-primary-500" />
        Hồ sơ kỳ này
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="size-2 rounded-full bg-primary-300" />
        Hồ sơ kỳ trước
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="size-2 rounded-full bg-success-500" />
        Nhập học
      </span>
    </div>
  );
}

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="mb-2 font-semibold text-text-primary">{label}</p>
      {payload.map((item) => (
        <p
          key={item.name}
          className="flex justify-between gap-5 py-0.5 text-text-secondary"
        >
          <span>{item.name}</span>
          <strong className="text-text-primary">
            {item.value?.toLocaleString("vi-VN")}
          </strong>
        </p>
      ))}
    </div>
  );
}

export default memo(EnrollmentTrend);
