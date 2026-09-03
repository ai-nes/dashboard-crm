"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { CheckCircle1, InfoTriangle } from "@tailgrids/icons";
import { PolarAngleAxis, RadialBar, RadialBarChart, Tooltip } from "recharts";
import DirectorChartTooltip from "./chart-tooltip";

const FORECAST_STATS = [
  { label: "Đã nhập học", value: "3,820", note: "76.4% mục tiêu", progress: 76.4, color: "bg-success-500", noteColor: "text-success-500" },
  { label: "Dự báo cuối kỳ", value: "4,680", note: "độ tin cậy 72%", progress: 93.6, color: "bg-brand-500", noteColor: "text-brand-500" },
  { label: "Khoảng thiếu", value: "320", note: "so với chỉ tiêu", progress: 32, color: "bg-warning-500", noteColor: "text-warning-500" },
];

export default function ConversionHealth() {
  return (
    <Card className="flex h-full min-w-0 flex-col bg-background-gray-primary">
      <CardHeader className="mb-1 items-start">
        <div>
          <CardTitle>Mục tiêu & dự báo</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tiến độ nhập học so với chỉ tiêu niên khóa</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-semibold text-badge-success-text">
          <CheckCircle1 size={13} aria-hidden="true" />
          Đang theo dõi
        </span>
      </CardHeader>

      <div className="relative mx-auto mt-2 h-56 w-full max-w-[360px] shrink-0">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <RadialBarChart
            cx="50%"
            cy="78%"
            innerRadius="63%"
            outerRadius="88%"
            barSize={16}
            startAngle={180}
            endAngle={0}
            data={[{ name: "Đạt chỉ tiêu", value: 76.4, fill: "var(--success-500)" }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<DirectorChartTooltip valueSuffix="% mục tiêu" />} cursor={false} />
            <RadialBar
              background={{ fill: "var(--background-gray-secondary)" }}
              dataKey="value"
              cornerRadius={12}
              isAnimationActive={false}
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center text-center">
          <span className="text-3xl font-semibold tracking-[-1px] text-text-primary">76.4%</span>
          <span className="mt-1 text-xs text-text-tertiary">đạt mục tiêu nhập học</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-card-border pt-4">
        {FORECAST_STATS.map((stat) => (
          <div key={stat.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs text-text-secondary">
                <span className={`size-2 rounded-full ${stat.color}`} aria-hidden="true" />
                {stat.label}
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                {stat.value}
                <span className={`font-medium ${stat.noteColor}`}>{stat.note}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-background-gray-secondary">
              <div
                className={`h-full rounded-full ${stat.color}`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-card-border bg-card-background p-3 text-xs leading-4 text-text-tertiary">
        <InfoTriangle size={15} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
        <span>Cần tăng độ phủ khu vực Đồng bằng sông Cửu Long để thu hẹp khoảng thiếu 320 hồ sơ nhập học.</span>
      </div>
    </Card>
  );
}
