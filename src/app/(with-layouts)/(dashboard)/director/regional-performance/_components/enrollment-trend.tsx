"use client";

import { memo, type ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
      title={`Xu hướng hồ sơ & nhập học · ${province.name}`}
      description="6 tháng gần nhất · hồ sơ đăng ký và số nhập học"
    >
      <LineChart
        data={province.trend}
        margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
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
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
        />
        <Tooltip content={<TooltipContent />} />
        <Line
          name="Hồ sơ đăng ký kỳ này"
          type="monotone"
          dataKey="applications"
          stroke="var(--primary-500)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          name="Hồ sơ đăng ký kỳ trước"
          type="monotone"
          dataKey="previousApplications"
          stroke="var(--primary-300)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
        <Line
          name="Số nhập học"
          type="monotone"
          dataKey="enrollments"
          stroke="var(--success-500)"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ChartCard>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
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
      <div className="h-68 min-h-68 w-full">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          {children}
        </ChartContainer>
      </div>
    </Card>
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
