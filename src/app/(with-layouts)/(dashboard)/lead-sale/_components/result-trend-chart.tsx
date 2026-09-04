"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";

import { resultTrendData } from "./data";
import ResultTrendTooltip from "./result-trend-tooltip";

type TrendRange = "4w" | "3m";

export default function ResultTrendChart() {
  const [range, setRange] = useState<TrendRange>("4w");
  const chartData = resultTrendData[range];

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start gap-3">
        <div>
          <CardTitle>Xu hướng kết quả</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Kết quả tư vấn và nhập học của cả đội theo thời gian.</p>
        </div>
        <Select
          value={range}
          onChange={(value) => setRange(value as TrendRange)}
          className="w-fit shrink-0"
          aria-label="Khoảng thời gian biểu đồ xu hướng kết quả"
        >
          <SelectTrigger size="sm" className="w-auto min-w-24">
            <SelectValue />
            <SelectIndicator className="text-button-primary-outline-text" />
          </SelectTrigger>
          <SelectContent className="min-w-24">
            <SelectItem id="4w" textValue="4 tuần" className="whitespace-nowrap">4 tuần</SelectItem>
            <SelectItem id="3m" textValue="3 tháng" className="whitespace-nowrap">3 tháng</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-secondary" aria-label="Chú thích biểu đồ">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" />Tư vấn hoàn tất</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success-500" />Nhập học</span>
      </div>

      <div className="mt-1 h-56 w-full" role="img" aria-label={`Biểu đồ xu hướng kết quả trong ${range === "4w" ? "4 tuần" : "3 tháng"}`}>
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} width={34} />
            <Tooltip cursor={{ stroke: "var(--border-color-base-300)", strokeDasharray: "4 4" }} content={<ResultTrendTooltip />} />
            <Line type="monotone" dataKey="consulted" name="Tư vấn hoàn tất" stroke="var(--primary-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={700} />
            <Line type="monotone" dataKey="admitted" name="Nhập học" stroke="var(--success-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={700} />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
