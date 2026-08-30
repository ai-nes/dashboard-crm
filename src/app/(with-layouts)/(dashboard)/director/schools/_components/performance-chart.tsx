"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolIntelligenceData, SchoolScoreBand } from "@/services/api/schools/types";

interface PerformanceChartProps {
  data: SchoolIntelligenceData;
}

const BAND_COLORS = ["var(--text-tertiary)", "var(--success-500)", "var(--primary-300)"];

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const availableShare = Math.round((data.availableStudents / data.grade12Students) * 100);

  return (
    <Card className="min-w-0 p-5 lg:p-6">
      <CardHeader className="mb-5 items-start">
        <div className="min-w-0">
          <CardTitle>Tệp học sinh khả dụng</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Mẫu số dùng để phân bổ nguồn lực, không phải toàn bộ học sinh lớp 12.</p>
        </div>
        <Badge color="success">{availableShare}% khả dụng</Badge>
      </CardHeader>

      <div className="grid gap-3 sm:grid-cols-[minmax(150px,0.55fr)_minmax(0,1fr)] sm:items-center">
        <div className="rounded-2xl bg-badge-success-background p-4">
          <p className="text-xs text-text-tertiary">Học sinh khả dụng</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-1px] text-success-500">{data.availableStudents.toLocaleString("vi-VN")}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">/ {data.grade12Students.toLocaleString("vi-VN")} học sinh lớp 12</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-card-background" aria-hidden="true"><div className="h-full rounded-full bg-success-500" style={{ width: availableShare + "%" }} /></div>
        </div>

        <div className="h-56 min-h-56 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data.scoreBands} layout="vertical" margin={{ top: 4, right: 34, left: 6, bottom: 2 }}>
              <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
              <XAxis type="number" hide domain={[0, data.grade12Students]} />
              <YAxis type="category" dataKey="label" width={112} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<ScoreBandTooltip />} />
              <Bar dataKey="students" name="Học sinh" radius={[0, 6, 6, 0]} barSize={24}>
                {data.scoreBands.map((item, index) => <Cell key={item.label} fill={BAND_COLORS[index]} />)}
                <LabelList dataKey="students" position="right" fill="var(--text-secondary)" fontSize={11} formatter={(value) => String(value)} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-card-border pt-4 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success-500" />Khoảng phù hợp: {data.availableStudents.toLocaleString("vi-VN")} học sinh</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-background-soft-300" />Phân loại theo khoảng điểm</span>
        <span className="text-text-tertiary">Phân vị điểm: P25 {data.academicDistribution.p25.toFixed(1)} · P50 {data.academicDistribution.p50.toFixed(1)} · P75 {data.academicDistribution.p75.toFixed(1)}</span>
      </div>
    </Card>
  );
}

function ScoreBandTooltip({ active, payload }: { active?: boolean; payload?: { payload?: SchoolScoreBand }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return (
    <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md">
      <p className="font-semibold text-text-primary">{item.label}</p>
      <p className="mt-1 text-text-secondary">{item.students.toLocaleString("vi-VN")} học sinh · {item.share}% lớp 12</p>
    </div>
  );
}
