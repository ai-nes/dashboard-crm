"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectIndicator,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import DirectorChartTooltip from "./chart-tooltip";
import { initialAdmissionsTrend } from "@/services/api/director-overview/data";
import type { AdmissionsTrend, TrendRange } from "./types";

const RANGE_LABELS: Record<TrendRange, string> = {
  "7d": "7 ngày qua",
  "30d": "30 ngày qua",
  year: "Theo niên khóa",
};

interface AdmissionsTrendProps {
  admissionsTrend?: AdmissionsTrend;
}

export default function AdmissionsTrendCard({ admissionsTrend = initialAdmissionsTrend }: AdmissionsTrendProps) {
  const trendData = admissionsTrend ?? initialAdmissionsTrend;
  const [range, setRange] = useState<TrendRange>(trendData.defaultRange ?? "30d");

  const currentRangeData = trendData.ranges[range] ?? initialAdmissionsTrend.ranges[range];
  const chartData = currentRangeData.points;
  const totals = useMemo(() => {
    if (currentRangeData.totals) {
      return currentRangeData.totals;
    }
    return {
      newLeads: chartData.reduce((acc, p) => acc + p.newLeads, 0),
      applicants: chartData.reduce((acc, p) => acc + p.applicants, 0),
      enrolled: chartData.reduce((acc, p) => acc + p.enrolled, 0),
    };
  }, [currentRangeData, chartData]);

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-card-background">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Xu hướng tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Diễn biến hồ sơ mới, nộp hồ sơ và nhập học theo thời gian
          </p>
        </div>
        <Select
          className="w-auto"
          value={range}
          onChange={(value) => setRange(value as TrendRange)}
          aria-label="Chọn khoảng thời gian cho biểu đồ xu hướng tuyển sinh"
        >
          <SelectTrigger size="sm" className="min-w-32">
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="7d" textValue={RANGE_LABELS["7d"]}>
              {RANGE_LABELS["7d"]}
            </SelectItem>
            <SelectItem id="30d" textValue={RANGE_LABELS["30d"]}>
              {RANGE_LABELS["30d"]}
            </SelectItem>
            <SelectItem id="year" textValue={RANGE_LABELS.year}>
              {RANGE_LABELS.year}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="mb-4 flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-card-border pb-4">
        <TrendSummary color="bg-brand-500" label="Hồ sơ mới" value={totals.newLeads} />
        <TrendSummary color="bg-primary-300" label="Đã nộp hồ sơ" value={totals.applicants} />
        <TrendSummary color="bg-success-500" label="Đã nhập học" value={totals.enrolled} />
      </div>

      <CardContent className="min-h-64 w-full flex-1 p-0 sm:min-h-72">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="director-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : value.toString())}
            />
            <Tooltip
              cursor={{ stroke: "var(--text-tertiary)", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={<DirectorChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="newLeads"
              name="Hồ sơ mới"
              stroke="var(--brand-500)"
              strokeWidth={2.5}
              fill="url(#director-trend-fill)"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5, fill: "var(--brand-500)", stroke: "var(--card-background)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="applicants"
              name="Đã nộp hồ sơ"
              stroke="var(--primary-300)"
              strokeWidth={2}
              fill="transparent"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: "var(--primary-300)", stroke: "var(--card-background)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="enrolled"
              name="Đã nhập học"
              stroke="var(--success-500)"
              strokeWidth={2}
              fill="transparent"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TrendSummary({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
      <div>
        <p className="text-[11px] text-text-tertiary">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value.toLocaleString("vi-VN")}</p>
      </div>
    </div>
  );
}
