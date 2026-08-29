"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface PerformanceChartProps {
  data: SchoolIntelligenceData;
}

type PerformanceRange = "6m" | "year";

const RANGE_LABELS: Record<PerformanceRange, string> = {
  "6m": "6 tháng gần đây",
  year: "Theo niên khóa",
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [range, setRange] = useState<PerformanceRange>("6m");
  const trend = data.performance[range];

  return (
    <Card className="flex min-w-0 flex-col p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Hiệu quả tuyển sinh theo thời gian</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Theo dõi mức quan tâm, hồ sơ nộp và nhập học của trường.</p>
        </div>
        <Select value={range} onChange={(value) => setRange(value as PerformanceRange)} aria-label="Chọn khoảng thời gian hiệu quả tuyển sinh">
          <SelectTrigger size="sm" className="min-w-38"><SelectValue /><SelectIndicator /></SelectTrigger>
          <SelectContent>
            {Object.entries(RANGE_LABELS).map(([key, label]) => <SelectItem key={key} id={key} textValue={label}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
        <Legend color="bg-primary-500" label="Prospects" />
        <Legend color="bg-primary-300" label="Applications" />
        <Legend color="bg-success-500" label="Enrollment" />
      </div>

      <div className="h-72 min-h-72 w-full">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={trend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} />
            <Tooltip content={<SchoolTooltip />} cursor={{ stroke: "var(--border-color-base-300)", strokeDasharray: "4 4" }} />
            <Line isAnimationActive animationDuration={800} type="monotone" dataKey="prospects" name="Prospects" stroke="var(--primary-500)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line isAnimationActive animationDuration={950} type="monotone" dataKey="applications" name="Applications" stroke="var(--primary-300)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line isAnimationActive animationDuration={1100} type="monotone" dataKey="enrollment" name="Enrollment" stroke="var(--success-500)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`size-2 rounded-full ${color}`} />{label}</span>;
}

function SchoolTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="mb-2 font-semibold text-text-primary">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => <p key={item.name} className="flex items-center justify-between gap-4 text-text-secondary"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong className="text-text-primary">{item.value?.toLocaleString("vi-VN")}</strong></p>)}
      </div>
    </div>
  );
}
