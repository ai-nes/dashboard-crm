"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolChoiceBreakdown, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolConversionFunnelProps {
  data: SchoolIntelligenceData;
}

const CHOICE_COLORS = ["var(--primary-500)", "var(--primary-300)", "var(--success-500)", "var(--warning-500)", "var(--text-tertiary)"];

export default function SchoolConversionFunnel({ data }: SchoolConversionFunnelProps) {
  return (
    <Card className="min-w-0 p-5 lg:p-6">
      <CardHeader className="mb-5 items-start">
        <div className="min-w-0">
          <CardTitle>Sau tốt nghiệp chọn gì?</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Bối cảnh cạnh tranh để chọn thông điệp và loại hoạt động phù hợp.</p>
        </div>
        <Badge color="warning">{data.geography.competitionDensity} cạnh tranh</Badge>
      </CardHeader>

      <div className="h-72 min-h-72 w-full">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data.postGraduationChoices} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
            <XAxis type="number" hide domain={[0, 50]} />
            <YAxis type="category" dataKey="label" width={132} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
            <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<ChoiceTooltip />} />
            <Bar dataKey="share" name="Tỷ trọng" radius={[0, 6, 6, 0]} barSize={24}>
              {data.postGraduationChoices.map((item, index) => <Cell key={item.label} fill={CHOICE_COLORS[index]} />)}
              <LabelList dataKey="share" position="right" fill="var(--text-secondary)" fontSize={11} formatter={(value) => String(value) + "%"} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-card-border pt-4 sm:grid-cols-4">
        <ChoiceStat label="Lớp 12" value={data.grade12Students.toLocaleString("vi-VN")} />
        <ChoiceStat label="Rời địa bàn" value={shareOfChoices(data, 1) + "%"} />
        <ChoiceStat label="Chọn tư thục" value={shareOfChoices(data, 2) + "%"} />
        <ChoiceStat label="Học sinh khả dụng" value={data.availableStudents.toLocaleString("vi-VN")} tone="text-success-500" />
      </div>

      <div className="mt-4 grid gap-2 border-t border-card-border pt-4 text-xs">
        <ContextItem label="Lựa chọn dẫn đầu" value={data.competitionContext.leadingChoice} />
        <ContextItem label="Lý do mất học sinh" value={data.competitionContext.lostReason} />
        <ContextItem label="Đơn vị ngoài trường" value={data.competitionContext.externalPresence} />
      </div>
    </Card>
  );
}

function shareOfChoices(data: SchoolIntelligenceData, index: number) {
  return data.postGraduationChoices.slice(index, index + 2).reduce((total, item) => total + item.share, 0);
}

function ChoiceStat({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return <div className="min-w-0"><p className="truncate text-[11px] text-text-tertiary">{label}</p><p className={"mt-1 text-sm font-semibold " + tone}>{value}</p></div>;
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return <div className="grid min-w-0 gap-1 rounded-lg bg-background-soft-50 px-3 py-2 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start"><p className="text-[11px] text-text-tertiary">{label}</p><p className="break-words text-sm font-medium leading-5 text-text-primary">{value}</p></div>;
}

function ChoiceTooltip({ active, payload }: { active?: boolean; payload?: { payload?: SchoolChoiceBreakdown }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md"><p className="max-w-48 font-semibold text-text-primary">{item.label}</p><p className="mt-1 text-text-secondary">{item.students.toLocaleString("vi-VN")} học sinh · {item.share}%</p></div>;
}
