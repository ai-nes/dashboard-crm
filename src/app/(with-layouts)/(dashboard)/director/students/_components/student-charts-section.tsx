"use client";

import { BarChart2, TrendUp2 } from "@tailgrids/icons";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { formatDate } from "@/utils/format-date";

import type { ChannelChartItem, TrendChartItem } from "./student-chart-types";
import StudentChartTooltip from "./student-chart-tooltip";
import type { Student360SectionProps } from "./types";

const CHANNEL_COLORS = [
  "var(--success-500)",
  "var(--info-500)",
  "var(--warning-500)",
  "var(--primary-500)",
];

export default function StudentChartsSection({ data }: Student360SectionProps) {
  const chartId = (data.student.code || "student")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  const trendData = useMemo<TrendChartItem[]>(
    () =>
      (data.probabilityTrend ?? []).map((item) => ({
        ...item,
        date: formatDate(item.date),
      })),
    [data.probabilityTrend],
  );
  const channels = useMemo<ChannelChartItem[]>(
    () =>
      (data.channelPerformance ?? []).map((item, index) => ({
        ...item,
        fill: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
      })),
    [data.channelPerformance],
  );

  const latestTrendScore = trendData[trendData.length - 1]?.score;
  const probability = data.insight?.probability ?? latestTrendScore ?? null;
  const baseline = data.insight?.baseline ?? trendData[0]?.score ?? null;
  const threshold = data.insight?.priorityThreshold ?? 70;
  const probabilityChange =
    probability != null && baseline != null ? probability - baseline : null;
  const totalTouches = channels.reduce(
    (sum, channel) => sum + channel.touches,
    0,
  );
  const avgResponse = channels.length
    ? Math.round(
        channels.reduce((sum, channel) => sum + channel.response, 0) /
          channels.length,
      )
    : null;
  const maxTouches = Math.max(...channels.map((channel) => channel.touches), 0);
  const touchDomainMax = maxTouches ? Math.ceil(maxTouches * 1.15) : 4;

  return (
    <section
      aria-label="Biểu đồ phân tích học sinh"
      className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
    >
      <Card className="min-w-0 border-success-200/60 p-5">
        <CardHeader className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Khả năng nhập học</CardTitle>
            {probabilityChange != null && (
              <Badge color={probabilityChange >= 0 ? "success" : "error"}>
                <TrendUp2 size={13} />
                {formatDelta(probabilityChange)} điểm
              </Badge>
            )}
            {data.insight?.potentialLabel && (
              <Badge color={getPotentialColor(data.insight.potentialLabel)}>
                {data.insight.potentialLabel}
              </Badge>
            )}
          </div>
        </CardHeader>
        <div className="mb-3 grid grid-cols-3 divide-x divide-card-border rounded-xl bg-badge-success-background py-3 text-center">
          <ChartStat label="Điểm đầu" value={formatPercent(baseline)} />
          <ChartStat
            label="Hiện tại"
            value={formatPercent(probability)}
            tone="text-success-500"
          />
          <ChartStat
            label="Ngưỡng"
            value={formatPercent(threshold)}
            tone="text-warning-500"
          />
        </div>
        <div className="h-64 min-h-64 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`student-probability-${chartId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--success-500)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--success-500)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <ReferenceLine
                y={threshold}
                stroke="var(--warning-500)"
                strokeDasharray="4 4"
                label={{
                  value: "Ngưỡng ưu tiên",
                  position: "insideTopRight",
                  fill: "var(--text-tertiary)",
                  fontSize: 11,
                }}
              />
              <Tooltip
                offset={{ x: 16, y: -16 }}
                cursor={{
                  stroke: "var(--success-500)",
                  strokeDasharray: "4 4",
                }}
                content={StudentChartTooltip}
              />
              <Area
                type="monotone"
                dataKey="score"
                name="Xác suất nhập học"
                stroke="var(--success-500)"
                strokeWidth={2.5}
                fill={`url(#student-probability-${chartId})`}
                dot={{
                  r: 4,
                  fill: "var(--success-500)",
                  strokeWidth: 0,
                  className: "transition-transform hover:scale-125",
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--success-500)",
                  stroke: "var(--card-background)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="min-w-0 border-info-500/20 p-5">
        <CardHeader className="mb-4">
          <CardTitle>Kênh tương tác</CardTitle>
          <span
            className="flex size-9 items-center justify-center rounded-xl bg-badge-sky-background text-badge-sky-text"
            aria-hidden="true"
          >
            <BarChart2 size={17} />
          </span>
        </CardHeader>
        <div className="h-64 min-h-64 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={channels}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide domain={[0, touchDomainMax]} />
              <YAxis
                type="category"
                dataKey="channel"
                width={68}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              />
              <Tooltip
                offset={{ x: 16, y: -16 }}
                cursor={{ fill: "var(--background-soft-50)" }}
                content={StudentChartTooltip}
              />
              <Bar
                dataKey="touches"
                name="Điểm chạm"
                radius={[0, 5, 5, 0]}
                barSize={18}
              >
                {channels.map((entry) => (
                  <Cell
                    key={entry.channel}
                    fill={entry.fill || "var(--primary-500)"}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-badge-sky-background p-3 text-center">
          <ChartStat
            label="Tổng lượt tương tác"
            value={channels.length ? String(totalTouches) : "-"}
          />
          <ChartStat
            label="Phản hồi bình quân"
            value={avgResponse != null ? `${avgResponse}%` : "-"}
            tone="text-info-500"
          />
        </div>
      </Card>
    </section>
  );
}

function formatPercent(value?: number | null): string {
  return value == null ? "-" : `${value}%`;
}

function formatDelta(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function getPotentialColor(
  label: NonNullable<
    NonNullable<Student360SectionProps["data"]["insight"]>["potentialLabel"]
  >,
) {
  if (label === "Tiềm năng cao") return "success" as const;
  if (label === "Tiềm năng vừa") return "warning" as const;
  return "error" as const;
}

function ChartStat({
  label,
  value,
  tone = "text-text-primary",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 px-2">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-base font-semibold tabular-nums ${tone}`}>
        {value}
      </p>
    </div>
  );
}
