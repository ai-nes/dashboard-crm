"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import type { TrendPoint } from "./data";

function ResultTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-md">
      <p className="mb-1.5 font-semibold text-text-primary">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center justify-between gap-6 py-0.5 text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
          <strong className="text-text-primary">{item.value}</strong>
        </p>
      ))}
    </div>
  );
}

interface ResultTrendChartProps {
  data: TrendPoint[];
}

export default function ResultTrendChart({ data }: ResultTrendChartProps) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Xu hướng kết quả</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Kết quả ghi nhận theo từng tuần trong kỳ.</p>
        </div>
        <span className="rounded-full bg-badge-success-background px-2.5 py-1 text-[11px] font-semibold text-success-600">Đang tăng</span>
      </CardHeader>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-secondary" aria-label="Chú thích biểu đồ xu hướng kết quả">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" />Đã liên hệ</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success-500" />Chuyển Sale</span>
      </div>

      <div className="mt-1 h-64 w-full" role="img" aria-label="Biểu đồ xu hướng kết quả tư vấn theo tuần">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} padding={{ left: 8, right: 10 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} width={36} domain={[0, "auto"]} allowDecimals={false} tickCount={5} />
            <Tooltip cursor={{ stroke: "var(--border-color-base-300)", strokeDasharray: "4 4" }} content={<ResultTrendTooltip />} />
            <Line type="monotone" dataKey="contacted" name="Đã liên hệ" stroke="var(--primary-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={700} />
            <Line type="monotone" dataKey="transferred" name="Chuyển Sale" stroke="var(--success-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={700} />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
