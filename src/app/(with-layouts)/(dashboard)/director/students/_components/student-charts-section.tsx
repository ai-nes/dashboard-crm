"use client";

import { BarChart2, TrendUp2 } from "@tailgrids/icons";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { formatDate } from "@/utils/format-date";

import StudentChartTooltip from "./student-chart-tooltip";
import type { Student360SectionProps } from "./types";

export default function StudentChartsSection({ data }: Student360SectionProps) {
  const chartId = data.student.code.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const probability = data.insight?.probability;
  const baseline = data.insight?.baseline ?? probability;
  const hasProbability = probability != null;
  const hasBaseline = baseline != null;
  const probabilityChange = hasProbability && hasBaseline ? probability - baseline : 0;

  const trendSource =
    data.probabilityTrend && data.probabilityTrend.length > 0
      ? data.probabilityTrend
      : [
          { date: "Bắt đầu", score: baseline ?? 0, touches: 1 },
          { date: "Hiện tại", score: probability ?? 0, touches: 2 },
        ];

  const trendData = trendSource.map((item, index, arr) => ({
    ...item,
    date: formatDate(item.date),
    score: index === arr.length - 1 && hasProbability ? probability : (item.score ?? 0),
  }));

  const channels =
    data.channelPerformance && data.channelPerformance.length > 0
      ? data.channelPerformance
      : [
          { channel: "Cuộc gọi", touches: 2, response: 100, fill: "var(--success-500)" },
          { channel: "Website", touches: 22, response: 82, fill: "var(--info-500)" },
          { channel: "Zalo", touches: 6, response: 84, fill: "var(--primary-500)" },
          { channel: "Sự kiện", touches: 2, response: 78, fill: "var(--warning-500)" },
        ];

  const totalTouches = channels.reduce((sum, ch) => sum + (ch.touches ?? 0), 0);
  const avgResponse = channels.length > 0 ? Math.round(channels.reduce((sum, ch) => sum + (ch.response ?? 0), 0) / channels.length) : 0;

  return (
    <section aria-label="Biểu đồ phân tích học sinh" className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
      <Card className="min-w-0 border-success-200/60 p-5">
        <CardHeader className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Khả năng nhập học</CardTitle>
            <Badge color="success">
              <TrendUp2 size={13} />
              {hasProbability ? `${probabilityChange >= 0 ? `+${probabilityChange}` : probabilityChange} điểm` : "-"}
            </Badge>
          </div>
        </CardHeader>
        <div className="mb-3 grid grid-cols-3 divide-x divide-card-border rounded-xl bg-badge-success-background py-3 text-center">
          <ChartStat label="Điểm đầu" value={hasBaseline ? `${baseline}%` : "-"} />
          <ChartStat label="Hiện tại" value={hasProbability ? `${probability}%` : "-"} tone={hasProbability ? "text-success-500" : "text-text-primary"} />
          <ChartStat label="Ngưỡng" value="70%" tone="text-warning-500" />
        </div>
        <div className="h-64 min-h-64 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={trendData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`student-probability-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <ReferenceLine y={70} stroke="var(--warning-500)" strokeDasharray="4 4" label={{ value: "Ngưỡng ưu tiên", position: "insideTopRight", fill: "var(--text-tertiary)", fontSize: 11 }} />
              <Tooltip cursor={{ stroke: "var(--success-500)", strokeDasharray: "4 4" }} content={StudentChartTooltip} />
              <Area type="monotone" dataKey="score" name="Xác suất nhập học" stroke="var(--success-500)" strokeWidth={2.5} fill={`url(#student-probability-${chartId})`} dot={{ r: 3, fill: "var(--success-500)", strokeWidth: 0 }} activeDot={{ r: 5, fill: "var(--success-500)", stroke: "var(--card-background)", strokeWidth: 2 }} />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>
      <Card className="min-w-0 border-info-500/20 p-5">
        <CardHeader className="mb-4">
          <CardTitle>Kênh tương tác</CardTitle>
          <span className="flex size-9 items-center justify-center rounded-xl bg-badge-sky-background text-badge-sky-text" aria-hidden="true">
            <BarChart2 size={17} />
          </span>
        </CardHeader>
        <div className="h-64 min-h-64 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={channels} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide domain={[0, 24]} />
              <YAxis type="category" dataKey="channel" width={68} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={StudentChartTooltip} />
              <Bar dataKey="touches" name="Điểm chạm" radius={[0, 5, 5, 0]} barSize={18}>
                {channels.map((entry) => (
                  <Cell key={entry.channel} fill={entry.fill || "var(--primary-500)"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-badge-sky-background p-3 text-center">
          <div>
            <p className="text-xs text-text-tertiary">Tổng lượt tương tác</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{totalTouches}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Phản hồi bình quân</p>
            <p className="mt-1 text-lg font-semibold text-info-500">{avgResponse}%</p>
          </div>
        </div>
      </Card>
    </section>
  );
}

function ChartStat({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 px-2">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-base font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
