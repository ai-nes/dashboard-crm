"use client";

import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolConversionFunnelProps {
  data: SchoolIntelligenceData;
}

const STAGE_COLORS = ["var(--background-soft-300)", "var(--primary-300)", "var(--primary-500)", "var(--success-500)"];

export default function SchoolConversionFunnel({ data }: SchoolConversionFunnelProps) {
  const stages = [
    { stage: "Lớp 12", value: data.grade12Students },
    { stage: "Prospects", value: data.prospects },
    { stage: "Hồ sơ", value: data.applications },
    { stage: "Nhập học", value: data.enrollment },
  ];

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Phễu chuyển đổi</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Khoảng cách từ dung lượng lớp 12 đến số nhập học dự kiến.</p>
        </div>
        <Badge color="success">{((data.enrollment / data.prospects) * 100).toFixed(1)}% prospects → nhập học</Badge>
      </CardHeader>

      <div className="h-64 min-h-64 w-full">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={stages} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString("vi-VN")} />
            <YAxis type="category" dataKey="stage" width={64} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
            <Tooltip content={<FunnelTooltip />} cursor={{ fill: "var(--background-soft-50)" }} />
            <Bar isAnimationActive animationDuration={900} dataKey="value" name="Số lượng" radius={[0, 6, 6, 0]}>
              {stages.map((item, index) => <Cell fill={STAGE_COLORS[index]} key={item.stage} />)}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-card-border pt-4 text-center">
        <div><p className="text-[11px] text-text-tertiary">Tiếp cận</p><p className="mt-1 text-sm font-semibold text-text-primary">{((data.prospects / data.grade12Students) * 100).toFixed(1)}%</p></div>
        <div><p className="text-[11px] text-text-tertiary">Nộp hồ sơ</p><p className="mt-1 text-sm font-semibold text-text-primary">{((data.applications / data.prospects) * 100).toFixed(1)}%</p></div>
        <div><p className="text-[11px] text-text-tertiary">Nhập học</p><p className="mt-1 text-sm font-semibold text-success-500">{data.enrollment}</p></div>
      </div>
    </Card>
  );
}

function FunnelTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md"><p className="font-semibold text-text-primary">{label}</p><p className="mt-1 text-text-secondary">{payload[0].value?.toLocaleString("vi-VN")} hồ sơ</p></div>;
}
