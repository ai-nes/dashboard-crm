"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SaleStudentStatus } from "@/services/api/sale";

import { STATUS_COLORS } from "./data";
import StudentStatusTooltip from "./student-status-tooltip";

interface StudentStatusChartProps {
  data: SaleStudentStatus;
}

export default function StudentStatusChart({ data }: StudentStatusChartProps) {
  const chartData = data.items.map((item) => ({
    ...item,
    value: item.count,
    color: STATUS_COLORS[item.id],
  }));

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Trạng thái học sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Phân bổ hồ sơ bạn đang phụ trách.</p>
        </div>
        <span className="rounded-full bg-background-soft-50 px-2.5 py-1 text-[11px] font-medium text-text-secondary">Cập nhật hôm nay</span>
      </CardHeader>

        <div className="relative mx-auto mt-3 h-52 w-full max-w-60" role="img" aria-label={`Biểu đồ donut trạng thái ${data.total} học sinh`}>
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Tooltip content={<StudentStatusTooltip />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              stroke="var(--card-background)"
              strokeWidth={4}
              isAnimationActive
              animationDuration={700}
            >
              {chartData.map((item) => <Cell key={item.id} fill={item.color} />)}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-[-1px] text-text-primary">{data.total}</span>
          <span className="mt-0.5 text-[11px] text-text-tertiary">học sinh</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-card-border pt-4 text-xs">
        {chartData.map((item) => (
          <div key={item.id} className="flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span className="truncate text-text-secondary">{item.label}</span>
            <span className="ml-auto font-semibold text-text-primary">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
