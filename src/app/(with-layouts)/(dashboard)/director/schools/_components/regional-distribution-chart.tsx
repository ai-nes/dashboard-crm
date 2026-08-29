"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolReportData } from "@/services/api/schools/types";

interface RegionalDistributionChartProps {
  data: SchoolReportData["regions"];
}

const REGION_COLORS = ["var(--primary-500)", "var(--primary-300)", "var(--success-500)"];

export default function RegionalDistributionChart({ data }: RegionalDistributionChartProps) {
  return (
    <Card className="min-w-0 p-5"><CardHeader className="mb-4"><div><CardTitle>Quy mô trường theo miền</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Số trường THPT và số trường cần ưu tiên khai thác.</p></div></CardHeader><div className="h-68"><ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, left: 20, bottom: 0 }}><CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" /><XAxis type="number" hide /><YAxis type="category" dataKey="region" axisLine={false} tickLine={false} width={76} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} /><Tooltip content={<RegionalTooltip />} cursor={{ fill: "var(--background-soft-50)" }} /><Bar dataKey="schools" name="Trường THPT" radius={[0, 6, 6, 0]}>{data.map((entry, index) => <Cell key={entry.region} fill={REGION_COLORS[index]} />)}<LabelList dataKey="schools" position="right" fill="var(--text-secondary)" fontSize={12} /></Bar></BarChart></ChartContainer></div></Card>
  );
}

function RegionalTooltip({ active, payload }: { active?: boolean; payload?: { payload?: { region: string; schools: number; prioritySchools: number; averagePotential: number } }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm"><p className="font-semibold text-text-primary">{item.region}</p><p className="mt-2 text-text-secondary">{item.schools.toLocaleString("vi-VN")} trường THPT</p><p className="mt-1 text-success-500">{item.prioritySchools.toLocaleString("vi-VN")} trường ưu tiên</p><p className="mt-1 text-text-secondary">Score TB: {item.averagePotential}/100</p></div>;
}
