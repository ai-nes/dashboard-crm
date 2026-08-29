"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { ProvinceSchoolReport } from "@/services/api/schools/types";

interface ProvinceRankingChartProps {
  provinces: ProvinceSchoolReport[];
}

export default function ProvinceRankingChart({ provinces }: ProvinceRankingChartProps) {
  const chartData = provinces.slice(0, 8).reverse();
  return (
    <Card className="min-w-0 p-5"><CardHeader className="mb-4"><div><CardTitle>Top tỉnh/thành có nhiều trường THPT</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Độ phủ directory, dùng để chọn địa bàn ưu tiên.</p></div></CardHeader><div className="h-68"><ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 36, left: 40, bottom: 0 }}><CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" /><XAxis type="number" hide /><YAxis type="category" dataKey="province" axisLine={false} tickLine={false} width={110} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} /><Tooltip content={<ProvinceTooltip />} cursor={{ fill: "var(--background-soft-50)" }} /><Bar dataKey="schools" name="Trường THPT" fill="var(--primary-500)" radius={[0, 6, 6, 0]}><LabelList dataKey="schools" position="right" fill="var(--text-secondary)" fontSize={12} /></Bar></BarChart></ChartContainer></div></Card>
  );
}

function ProvinceTooltip({ active, payload }: { active?: boolean; payload?: { payload?: ProvinceSchoolReport }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm"><p className="font-semibold text-text-primary">{item.province}</p><p className="mt-2 text-text-secondary">{item.schools.toLocaleString("vi-VN")} trường THPT</p><p className="mt-1 text-success-500">{item.prioritySchools.toLocaleString("vi-VN")} trường ưu tiên</p><p className="mt-1 text-text-secondary">Score TB: {item.averagePotential}/100</p></div>;
}
