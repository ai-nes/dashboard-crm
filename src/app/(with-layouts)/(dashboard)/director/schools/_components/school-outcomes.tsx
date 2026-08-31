"use client";

import { useState } from "react";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolChoiceBreakdown, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolOutcomesProps {
  data: SchoolIntelligenceData;
}

const BAND_COLORS = ["var(--text-tertiary)", "var(--success-500)", "var(--primary-300)"];
const CHOICE_COLORS = ["var(--primary-500)", "var(--primary-300)", "var(--info-500)", "var(--success-500)", "var(--text-tertiary)", "var(--warning-500)"];
const SCORE_BAND_LABELS: Record<string, string> = {
  "Ngoài khoảng phù hợp": "Chưa phù hợp",
  "Học sinh khả dụng": "Phù hợp để tư vấn",
  "Trên khoảng phù hợp": "Cao hơn mục tiêu",
};
const SCORE_BAND_KEYS = ["notFit", "fit", "aboveTarget"] as const;
type ScoreBandKey = (typeof SCORE_BAND_KEYS)[number];

interface ScoreDistributionSegment {
  key: ScoreBandKey;
  label: string;
  students: number;
  share: number;
  color: string;
}

export default function SchoolOutcomes({ data }: SchoolOutcomesProps) {
  const [hoveredSegmentKey, setHoveredSegmentKey] = useState<ScoreBandKey | null>(null);
  const hasScoreDistribution = data.scoreBands.length > 0;
  const hasChoiceBreakdown = data.postGraduationChoices.length > 0;
  const chartChoices = hasChoiceBreakdown
    ? data.postGraduationChoices
    : [{ label: "-", share: 0, students: 0 }];
  const scoreDistribution = SCORE_BAND_KEYS.map((key, index) => {
    const source = data.scoreBands[index];
    return {
      key,
      label: SCORE_BAND_LABELS[source?.label] ?? source?.label ?? "Khác",
      students: source?.students ?? (hasScoreDistribution ? 0 : 1),
      share: source?.share ?? 0,
      color: BAND_COLORS[index],
    } satisfies ScoreDistributionSegment;
  });
  const centerSegment = scoreDistribution.find((segment) => segment.key === hoveredSegmentKey) ?? scoreDistribution[1];

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="min-w-0">
          <CardTitle>Quy mô tuyển sinh</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Xác định nhóm học sinh nên ưu tiên tư vấn</p>
        </div>
      </CardHeader>

      <div className="grid min-w-0 gap-6 p-5 lg:grid-cols-2 lg:p-6">
        <div className="min-w-0">
          <SectionHeading title="Nhóm ưu tiên tư vấn" />
          <div className="relative mt-4 h-56 min-h-56 w-full">
            <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={scoreDistribution} dataKey="students" nameKey="label" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="var(--card-background)" strokeWidth={3} onMouseEnter={(_, index) => setHoveredSegmentKey(scoreDistribution[index]?.key ?? null)} onMouseLeave={() => setHoveredSegmentKey(null)}>
                  {scoreDistribution.map((segment) => <Cell key={segment.key} fill={segment.color} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-semibold text-text-primary">{hasScoreDistribution ? centerSegment.students.toLocaleString("vi-VN") : "-"}</p>
              <p className="mt-0.5 max-w-28 text-center text-xs leading-4 text-text-tertiary">{hoveredSegmentKey ? centerSegment.label : "HS phù hợp"}</p>
              {hoveredSegmentKey ? <p className="mt-0.5 text-xs font-medium text-text-secondary">{hasScoreDistribution ? `${centerSegment.share}% tổng số` : "-"}</p> : null}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scoreDistribution.map((segment) => (
              <div key={segment.key} className="min-w-0">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                  <p className="min-w-0 text-xs leading-4 text-text-secondary">{segment.label}</p>
                </div>
                <p className="mt-1 pl-4 text-sm font-semibold text-text-primary">{hasScoreDistribution ? segment.students.toLocaleString("vi-VN") : "-"} <span className="font-normal text-text-tertiary">({hasScoreDistribution ? `${segment.share}%` : "-"})</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-card-border lg:pl-6">
          <div className="flex items-center justify-between gap-3">
            <SectionHeading title="Lựa chọn sau THPT" />
            <Badge color="warning">Cạnh tranh {data.geography.competitionDensity.toLowerCase()}</Badge>
          </div>

          <div className="mt-3 h-56 min-h-56 w-full">
            <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartChoices} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
                <XAxis type="number" hide domain={[0, 40]} />
                <YAxis type="category" dataKey="label" width={140} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<ChoiceTooltip />} />
                <Bar dataKey="share" name="Tỷ trọng" radius={[0, 6, 6, 0]} barSize={18}>
                  {chartChoices.map((item, index) => <Cell key={`${item.label}-${index}`} fill={CHOICE_COLORS[index]} />)}
                  <LabelList dataKey="share" position="right" fill="var(--text-secondary)" fontSize={11} formatter={(value) => hasChoiceBreakdown ? String(value) + "%" : "-"} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          <div className="mt-4 grid gap-2 border-t border-card-border pt-4 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
            <ContextItem label="Đối thủ chính" value={data.competitionContext.leadingChoice} />
            <ContextItem label="Lý do chọn khác" value={data.competitionContext.lostReason} />
            <ContextItem label="Hoạt động ngoài trường" value={data.competitionContext.externalPresence} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-text-primary">{title}</p>
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl border border-card-border bg-background-soft-50 px-3 py-2.5"><p className="text-[11px] text-text-tertiary">{label}</p><p className="mt-1 break-words text-sm font-medium leading-5 text-text-primary">{value}</p></div>;
}

function ChoiceTooltip({ active, payload }: { active?: boolean; payload?: { payload?: SchoolChoiceBreakdown }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md"><p className="max-w-48 font-semibold text-text-primary">{item.label}</p><p className="mt-1 text-text-secondary">{item.students.toLocaleString("vi-VN")} học sinh · {item.share}%</p></div>;
}
