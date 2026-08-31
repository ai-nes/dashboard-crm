"use client";

import { Target3 } from "@tailgrids/icons";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolClassification, SchoolIntelligenceData } from "@/services/api/schools/types";

import { POTENTIAL_THRESHOLD, RELATIONSHIP_THRESHOLD } from "@/services/api/schools/classification";

interface SchoolPotentialBreakdownProps {
  data: SchoolIntelligenceData;
}

interface ScoreComparison {
  label: string;
  current: number;
  target: number;
  color: string;
}

const groupBadge: Record<SchoolClassification, "success" | "primary" | "warning" | "gray"> = {
  "Trọng điểm": "success",
  "Mở rộng": "primary",
  "Duy trì": "warning",
  "Sàng lọc": "gray",
};

const groupLabel: Record<SchoolClassification, string> = {
  "Trọng điểm": "Trọng điểm",
  "Mở rộng": "Mở rộng",
  "Duy trì": "Duy trì",
  "Sàng lọc": "Theo dõi",
};

export default function SchoolPotentialBreakdown({ data }: SchoolPotentialBreakdownProps) {
  const scores: ScoreComparison[] = [
    { label: "Tiềm năng tuyển sinh", current: data.potentialScore, target: POTENTIAL_THRESHOLD, color: "var(--primary-500)" },
    { label: "Quan hệ với trường", current: data.relationship.score, target: RELATIONSHIP_THRESHOLD, color: "var(--success-500)" },
  ];
  const availableShare = data.grade12Students > 0
    ? Math.round((data.availableStudents / data.grade12Students) * 100)
    : null;

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden p-0">
      <CardHeader className="shrink-0 border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><Target3 size={18} /></span>
          <div className="min-w-0">
            <CardTitle>Mức độ ưu tiên của trường</CardTitle>
            <p className="mt-1 text-xs text-text-tertiary">So sánh điểm hiện tại với mốc cần đạt</p>
          </div>
        </div>
        <Badge color={groupBadge[data.classification.group]}>{groupLabel[data.classification.group]}</Badge>
      </CardHeader>

      <div className="flex min-h-0 flex-1 flex-col p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Điểm hiện tại và mốc cần đạt</p>
            <p className="mt-1 text-xs text-text-tertiary">Thang điểm 100</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />Hiện tại</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-background-soft-300" aria-hidden="true" />Mốc cần đạt</span>
          </div>
        </div>

        <div className="mt-4 min-h-64 w-full flex-1">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={scores} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 4 }} barCategoryGap={18}>
              <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={128} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<ScoreComparisonTooltip />} />
              <Bar dataKey="current" name="Hiện tại" barSize={12} radius={[0, 5, 5, 0]}>
                {scores.map((score) => <Cell key={score.label} fill={score.color} />)}
                <LabelList dataKey="current" position="right" fill="var(--text-secondary)" fontSize={11} formatter={(value) => String(value)} />
              </Bar>
              <Bar dataKey="target" name="Mốc cần đạt" fill="var(--background-soft-300)" barSize={12} radius={[0, 5, 5, 0]}>
                <LabelList dataKey="target" position="right" fill="var(--text-tertiary)" fontSize={11} formatter={(value) => String(value)} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {scores.map((score) => <GapItem key={score.label} score={score} />)}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-card-border pt-4">
          <SummaryItem label="HS phù hợp để tư vấn" value={data.availableStudents ? data.availableStudents.toLocaleString("vi-VN") + " HS" : "-"} />
          <SummaryItem label="Tỷ lệ trong khối 12" value={availableShare === null ? "-" : availableShare + "%"} tone="text-success-500" />
        </div>
      </div>
    </Card>
  );
}

function GapItem({ score }: { score: ScoreComparison }) {
  const gap = score.current - score.target;
  const reachedTarget = gap >= 0;

  return (
    <div className="rounded-xl bg-background-soft-50 px-3 py-2.5">
      <p className="truncate text-xs text-text-tertiary" title={score.label}>{score.label}</p>
      <p className={`mt-1 text-lg font-semibold ${reachedTarget ? "text-success-500" : "text-warning-500"}`}>{gap > 0 ? "+" : ""}{gap} điểm</p>
      <p className="mt-0.5 text-[11px] text-text-secondary">{reachedTarget ? "Đã đạt mốc" : "Cần cải thiện"}</p>
    </div>
  );
}

function ScoreComparisonTooltip({ active, payload }: { active?: boolean; payload?: { payload?: ScoreComparison }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md">
      <p className="font-semibold text-text-primary">{item.label}</p>
      <p className="mt-1 text-text-secondary">Hiện tại: <strong className="text-text-primary">{item.current}/100</strong></p>
      <p className="mt-1 text-text-secondary">Mốc cần đạt: <strong className="text-text-primary">{item.target}/100</strong></p>
    </div>
  );
}

function SummaryItem({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return <div className="min-w-0"><p className="text-xs text-text-tertiary">{label}</p><p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p></div>;
}
