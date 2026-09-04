"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";

import { contactTrendData } from "./_components/data";

type TrendRange = "7d" | "30d";

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
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

export default function ContactTrendChart() {
  const [range, setRange] = useState<TrendRange>("7d");
  const chartData = contactTrendData[range];

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start gap-3">
        <div>
          <CardTitle>Xu hướng liên hệ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Số lượt liên hệ và kết nối thành công.</p>
        </div>
        <Select
          value={range}
          onChange={(value) => setRange(value as TrendRange)}
          className="w-fit shrink-0"
          aria-label="Khoảng thời gian biểu đồ xu hướng liên hệ"
        >
          <SelectTrigger size="sm" className="w-auto min-w-28">
            <SelectValue />
            <SelectIndicator className="text-button-primary-outline-text" />
          </SelectTrigger>
          <SelectContent className="min-w-28">
            <SelectItem id="7d" textValue="7 ngày" className="whitespace-nowrap">7 ngày</SelectItem>
            <SelectItem id="30d" textValue="30 ngày" className="whitespace-nowrap">30 ngày</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-secondary" aria-label="Chú thích biểu đồ">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" />Tổng liên hệ</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-info-500" />Đã kết nối</span>
      </div>

      <div className="mt-1 h-56 w-full" role="img" aria-label="Biểu đồ xu hướng liên hệ trong 7 ngày">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} width={34} />
            <Tooltip cursor={{ stroke: "var(--border-color-base-300)", strokeDasharray: "4 4" }} content={<TrendTooltip />} />
            <Line type="monotone" dataKey="contacts" name="Tổng liên hệ" stroke="var(--primary-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={700} />
            <Line type="monotone" dataKey="connected" name="Đã kết nối" stroke="var(--info-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--info-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={700} />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
