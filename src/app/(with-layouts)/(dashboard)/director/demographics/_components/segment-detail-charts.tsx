"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, Area, ComposedChart, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import OverviewTooltip from "./overview-tooltip";
import type { DemographicSegment } from "./types";

export default function SegmentDetailCharts({ segment }: { segment: DemographicSegment }) {
  const momentum = buildMomentum(segment);
  const cohorts = buildCohorts(segment);
  const profile = buildProfile(segment);
  const channels = [
    { name: "Social", value: 38, fill: "var(--brand-500)" },
    { name: "Sự kiện", value: 24, fill: "var(--success-500)" },
    { name: "Website", value: 22, fill: "var(--info-500)" },
    { name: "Giới thiệu", value: 16, fill: "var(--warning-500)" },
  ];

  return (
    <section aria-label="Biểu đồ chi tiết phân khúc" className="space-y-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <Card className="min-w-0 overflow-hidden bg-background-gray-primary"><CardHeader className="mb-4"><div><CardTitle>Nhịp tăng trưởng của phân khúc</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Quy mô hồ sơ tích lũy so với benchmark cùng nhóm ngành.</p></div><span className="text-xs font-semibold text-success-500">+{segment.growth}% MoM</span></CardHeader><div className="h-72"><ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}><ComposedChart data={momentum} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id={`segment-momentum-${segment.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip content={<OverviewTooltip />} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} /><Area type="monotone" dataKey="current" name="Phân khúc hiện tại" stroke="var(--brand-500)" strokeWidth={2.5} fill={`url(#segment-momentum-${segment.id})`} dot={false} isAnimationActive={false} /><Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="var(--text-300)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} /></ComposedChart></ChartContainer></div></Card>
        <Card className="min-w-0 overflow-hidden bg-card-background"><CardHeader className="mb-3"><div><CardTitle>Hồ sơ cạnh tranh</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Cân bằng giữa quy mô, nhu cầu và chuyển đổi.</p></div></CardHeader><div className="h-72"><ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}><RadarChart data={profile} outerRadius="70%"><PolarGrid stroke="var(--card-border)" /><PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} /><Tooltip content={<OverviewTooltip />} /><Radar name="Phân khúc" dataKey="current" stroke="var(--brand-500)" fill="var(--brand-500)" fillOpacity={0.2} /><Radar name="Benchmark" dataKey="benchmark" stroke="var(--text-300)" fill="var(--text-300)" fillOpacity={0.06} /></RadarChart></ChartContainer></div></Card>
      </div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Card className="min-w-0 overflow-hidden bg-card-background"><CardHeader className="mb-4"><div><CardTitle>Hiệu suất theo hành trình</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ trên tổng prospect so với benchmark phân khúc tương đồng.</p></div></CardHeader><div className="h-72"><ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={cohorts} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 0 }}><CartesianGrid horizontal={false} strokeDasharray="4 4" /><XAxis type="number" axisLine={false} tickLine={false} unit="%" /><YAxis type="category" dataKey="stage" width={96} axisLine={false} tickLine={false} /><Tooltip content={<OverviewTooltip suffix="%" />} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="current" name="Hiện tại" fill="var(--brand-500)" radius={[0, 5, 5, 0]} maxBarSize={18} /><Bar dataKey="benchmark" name="Benchmark" fill="var(--background-soft-300)" radius={[0, 5, 5, 0]} maxBarSize={18} /></BarChart></ChartContainer></div></Card>
        <Card className="min-w-0 overflow-hidden bg-background-gray-primary"><CardHeader className="mb-2"><div><CardTitle>Kênh tạo tương tác</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ trọng điểm chạm đầu tiên của phân khúc.</p></div></CardHeader><div className="relative h-56"><ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}><PieChart><Tooltip content={<OverviewTooltip suffix="%" />} /><Pie data={channels} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3} cornerRadius={6} stroke="var(--card-background)" strokeWidth={3} isAnimationActive={false} /></PieChart></ChartContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl font-semibold text-text-primary">1.280</strong><span className="text-[11px] text-text-tertiary">engaged</span></div></div><div className="grid grid-cols-2 gap-2">{channels.map((channel) => <div key={channel.name} className="flex items-center justify-between rounded-lg bg-card-background px-3 py-2 text-xs"><span className="flex items-center gap-2 text-text-secondary"><span className="size-2 rounded-full" style={{ backgroundColor: channel.fill }} />{channel.name}</span><strong className="text-text-primary">{channel.value}%</strong></div>)}</div></Card>
      </div>
    </section>
  );
}

function buildMomentum(segment: DemographicSegment) {
  const growthBase = Math.max(0.7, 1 - segment.growth / 100);
  const factors = [0.58, 0.66, 0.73, 0.81, growthBase, 1];
  return factors.map((factor, index) => ({ month: `T${index + 1}`, current: Math.round(segment.prospects * factor), benchmark: Math.round(segment.prospects * (0.62 + index * 0.065)) }));
}

function buildCohorts(segment: DemographicSegment) {
  return [
    { stage: "Đã tương tác", current: +((segment.engaged / segment.prospects) * 100).toFixed(1), benchmark: 44.8 },
    { stage: "Đủ điều kiện", current: +((segment.qualified / segment.prospects) * 100).toFixed(1), benchmark: 9.6 },
    { stage: "Nộp hồ sơ", current: +((segment.applications / segment.prospects) * 100).toFixed(1), benchmark: 3.2 },
    { stage: "Nhập học", current: segment.conversion, benchmark: 1.3 },
  ];
}

function buildProfile(segment: DemographicSegment) {
  return [
    { metric: "Quy mô", current: Math.min(96, Math.round(segment.prospects / 55)), benchmark: 68 },
    { metric: "Nhu cầu", current: Math.min(98, 58 + segment.growth), benchmark: 65 },
    { metric: "Qualified", current: Math.min(95, Math.round((segment.qualified / segment.prospects) * 600)), benchmark: 58 },
    { metric: "Application", current: Math.min(92, Math.round((segment.applications / segment.prospects) * 1450)), benchmark: 47 },
    { metric: "Nhập học", current: Math.min(90, Math.round(segment.conversion * 30)), benchmark: 42 },
  ];
}
