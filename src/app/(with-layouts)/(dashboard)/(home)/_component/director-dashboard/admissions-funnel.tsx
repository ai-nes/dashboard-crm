"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";

import DirectorChartTooltip from "./chart-tooltip";
import { admissionsPipeline } from "./data";

const PIPELINE_COLORS = [
  "var(--brand-500)",
  "var(--primary-300)",
  "var(--info-500)",
  "var(--primary-400)",
  "var(--warning-500)",
  "var(--primary-600)",
  "var(--success-500)",
];

const chartData = admissionsPipeline.map((stage, index) => ({
  ...stage,
  color: PIPELINE_COLORS[index],
}));

export default function AdmissionsFunnel() {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Phễu tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Từ hồ sơ tiềm năng đến nhập học trong niên khóa 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/director/admission-funnel" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
            Phân tích chi tiết
          </Link>
          <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">
            Niên khóa 2026
          </span>
        </div>
      </CardHeader>

      <div className="min-h-72 w-full flex-1 sm:min-h-80" aria-label="Biểu đồ tiến độ phễu tuyển sinh">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 28, left: -4, bottom: 0 }}
            barCategoryGap={12}
          >
            <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={108}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }}
              content={<DirectorChartTooltip valueSuffix="%" />}
            />
            <Bar
              dataKey="percentage"
              name="Tỷ trọng"
              radius={[0, 7, 7, 0]}
              background={{ fill: "var(--background-gray-secondary)" }}
              maxBarSize={24}
              isAnimationActive={false}
            >
              {chartData.map((stage) => (
                <Cell key={stage.id} fill={stage.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-card-border pt-4">
        <PipelineSummary label="Tổng hồ sơ tiềm năng" value="24,860" />
        <PipelineSummary label="Đã trúng tuyển" value="4,820" />
        <PipelineSummary label="Tỷ lệ nhập học" value="15.4%" valueClassName="text-success-500" />
      </div>
    </Card>
  );
}

function PipelineSummary({
  label,
  value,
  valueClassName = "text-text-primary",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}
