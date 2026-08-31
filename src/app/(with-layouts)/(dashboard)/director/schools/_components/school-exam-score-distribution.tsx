"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolExamScoreBand, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolExamScoreDistributionProps {
  data: SchoolIntelligenceData;
}

const EMPTY_SCORE_BANDS: SchoolExamScoreBand[] = [
  { label: "0–4", students: 0, share: 0 },
  { label: "4–5", students: 0, share: 0 },
  { label: "5–6", students: 0, share: 0 },
  { label: "6–7", students: 0, share: 0 },
  { label: "7–8", students: 0, share: 0 },
  { label: "8–10", students: 0, share: 0 },
];

export default function SchoolExamScoreDistribution({ data }: SchoolExamScoreDistributionProps) {
  const scoreBands = data.examScoreBands;
  const hasData = scoreBands.some((band) => band.students > 0);
  const chartBands = [...(hasData ? scoreBands : EMPTY_SCORE_BANDS)].reverse();
  const totalStudents = scoreBands.reduce((total, band) => total + band.students, 0);

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="min-w-0">
          <CardTitle>Phổ điểm THPT</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Phân bố học sinh khối 12 theo khoảng điểm</p>
        </div>
        <Badge color={hasData ? "success" : "gray"}>{hasData ? `${totalStudents.toLocaleString("vi-VN")} HS` : "Chưa có dữ liệu"}</Badge>
      </CardHeader>

      <div className="min-w-0 p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />
            Tỷ trọng học sinh
          </span>
          <p className="text-xs text-text-tertiary">Thang điểm 0–10</p>
        </div>

        <div className="mt-4 h-[25rem] min-h-[25rem] w-full" aria-label="Biểu đồ phổ điểm học sinh khối 12">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={chartBands} layout="vertical" margin={{ top: 4, right: 42, bottom: 4, left: 4 }} barCategoryGap={12}>
              <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={54} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<ExamScoreTooltip />} />
              <Bar dataKey="share" name="Tỷ trọng" fill="var(--primary-500)" barSize={20} radius={[0, 5, 5, 0]}>
                <LabelList dataKey="share" position="right" fill="var(--text-secondary)" fontSize={11} formatter={(value) => hasData ? `${value}%` : "-"} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {hasData ? <p className="mt-4 border-t border-card-border pt-4 text-xs leading-5 text-text-tertiary">Tỷ trọng được tính trên {totalStudents.toLocaleString("vi-VN")} học sinh khối 12 của trường.</p> : null}
      </div>
    </Card>
  );
}

function ExamScoreTooltip({ active, payload }: { active?: boolean; payload?: { payload?: SchoolExamScoreBand }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md">
      <p className="font-semibold text-text-primary">Khoảng {item.label} điểm</p>
      <p className="mt-1 text-text-secondary">{item.students.toLocaleString("vi-VN")} học sinh · {item.share}%</p>
    </div>
  );
}
