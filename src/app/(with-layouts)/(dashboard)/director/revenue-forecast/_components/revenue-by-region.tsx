"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import RevenueChartTooltip from "./chart-tooltip";
import {
  billions,
  percent,
  useRevenueForecastData,
} from "./revenue-forecast-context";

export default function RevenueByRegion() {
  const { regions } = useRevenueForecastData();
  const revenueByRegion = regions.map((row) => ({
    ...row,
    actual: billions(row.actual),
    forecast: billions(row.forecast),
  }));
  const largest = regions[0];
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Doanh thu theo vùng</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Đóng góp thực tế và phần doanh thu dự báo cuối kỳ
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-text-tertiary">
          <LegendItem label="Thực tế" className="bg-brand-500" />
          <LegendItem label="Dự báo" className="bg-primary-300" />
        </div>
      </CardHeader>

      <div
        className="h-[230px] w-full sm:h-[260px] xl:h-[300px]"
        aria-label="Biểu đồ doanh thu theo vùng"
      >
        <ChartContainer
          className="h-full w-full"
          height="100%"
          width="100%"
          minWidth={0}
          minHeight={0}
        >
          <BarChart
            data={revenueByRegion}
            margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid
              stroke="var(--border-color-base-100)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              dy={10}
              tickFormatter={(value: string) =>
                value === "Đồng bằng sông Cửu Long"
                  ? "ĐBSCL"
                  : value.replace("TP. ", "")
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              tickFormatter={(value: number) => `${value}B`}
            />
            <Tooltip
              content={<RevenueChartTooltip valueSuffix="B" />}
              cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }}
            />
            <Bar
              dataKey="actual"
              name="Thực tế"
              fill="var(--brand-500)"
              radius={[5, 5, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
            <Bar
              dataKey="forecast"
              name="Dự báo"
              fill="var(--primary-300)"
              radius={[5, 5, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-card-border pt-4">
        <RegionSummary
          label="Tỷ trọng lớn nhất"
          value={largest ? `${percent(largest.share)} · ${largest.label}` : "—"}
        />
        <RegionSummary
          label="Tăng mạnh nhất"
          value={
            largest
              ? `${billions((largest.forecast ?? 0) - (largest.actual ?? 0)).toLocaleString("vi-VN")}B · ${largest.label}`
              : "—"
          }
          tone="text-brand-500"
        />
        <RegionSummary
          label="Tăng thêm dự báo"
          value={`${billions(regions.reduce((sum, row) => sum + (row.forecast ?? 0) - (row.actual ?? 0), 0)).toLocaleString("vi-VN")}B`}
          tone="text-success-500"
        />
      </div>
    </Card>
  );
}

function LegendItem({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${className}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function RegionSummary({
  label,
  value,
  tone = "text-text-primary",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
