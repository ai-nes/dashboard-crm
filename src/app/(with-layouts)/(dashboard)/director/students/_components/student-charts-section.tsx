"use client";

import { ArrowUpward, BarChart2, TrendUp2 } from "@tailgrids/icons";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import StudentChartTooltip from "./student-chart-tooltip";
import type { Student360SectionProps } from "./types";

const probabilityTrend = [
  { date: "28/05", score: 41, touches: 2 },
  { date: "30/05", score: 48, touches: 4 },
  { date: "02/06", score: 59, touches: 7 },
  { date: "04/06", score: 68, touches: 11 },
  { date: "05/06", score: 76, touches: 15 },
  { date: "06/06", score: 82, touches: 18 },
];

const channelPerformance = [
  { channel: "Cuộc gọi", touches: 2, response: 100 },
  { channel: "Website", touches: 22, response: 82 },
  { channel: "Zalo", touches: 6, response: 84 },
  { channel: "Sự kiện", touches: 2, response: 78 },
];

export default function StudentChartsSection({ data }: Student360SectionProps) {
  const chartId = data.student.code.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const trendData = probabilityTrend.map((item, index) => ({ ...item, score: index === probabilityTrend.length - 1 ? data.insight.probability : item.score }));

  return <section aria-label="Biểu đồ phân tích học sinh" className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"><Card className="min-w-0 p-5"><CardHeader className="mb-4"><div><div className="flex flex-wrap items-center gap-2"><CardTitle>Diễn biến xác suất nhập học</CardTitle><Badge color="success"><TrendUp2 size={13} />+{data.insight.scoreDelta ?? 13} điểm</Badge></div><p className="mt-1 text-xs leading-5 text-text-tertiary">Điểm AI thay đổi theo các điểm chạm và tín hiệu gia đình.</p></div><span className="hidden items-center gap-1 text-xs text-text-tertiary sm:flex"><ArrowUpward size={13} className="text-success-500" />6 điểm chạm</span></CardHeader><div className="h-64 min-h-64 w-full"><ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}><AreaChart data={trendData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id={`student-probability-${chartId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.24} /><stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} /><ReferenceLine y={70} stroke="var(--warning-500)" strokeDasharray="4 4" label={{ value: "Ngưỡng ưu tiên", position: "insideTopRight", fill: "var(--text-tertiary)", fontSize: 11 }} /><Tooltip cursor={{ stroke: "var(--primary-200)", strokeDasharray: "4 4" }} content={StudentChartTooltip} /><Area type="monotone" dataKey="score" name="Xác suất" stroke="var(--primary-500)" strokeWidth={2.5} fill={`url(#student-probability-${chartId})`} dot={{ r: 3, fill: "var(--primary-500)", strokeWidth: 0 }} activeDot={{ r: 5, fill: "var(--primary-500)", stroke: "var(--card-background)", strokeWidth: 2 }} /></AreaChart></ChartContainer></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-tertiary"><span>Điểm bắt đầu {data.insight.baseline ?? 41}%</span><span>Hiện tại {data.insight.probability}%</span><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-warning-500" />Ngưỡng ưu tiên 70%</span></div></Card><Card className="min-w-0 p-5"><CardHeader className="mb-4"><div><CardTitle>Hiệu quả kênh tương tác</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Số điểm chạm và tỷ lệ phản hồi.</p></div><span className="flex size-8 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><BarChart2 size={17} /></span></CardHeader><div className="h-64 min-h-64 w-full"><ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={channelPerformance} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}><CartesianGrid horizontal={false} /><XAxis type="number" hide domain={[0, 24]} /><YAxis type="category" dataKey="channel" width={68} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} /><Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={StudentChartTooltip} /><Bar dataKey="touches" name="Điểm chạm" fill="var(--primary-500)" radius={[0, 5, 5, 0]} barSize={18} /></BarChart></ChartContainer></div><div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-background-soft-50 p-3 text-center"><div><p className="text-xs text-text-tertiary">Tổng điểm chạm</p><p className="mt-1 text-lg font-semibold text-text-primary">32</p></div><div><p className="text-xs text-text-tertiary">Phản hồi bình quân</p><p className="mt-1 text-lg font-semibold text-success-500">86%</p></div></div></Card></section>;
}
