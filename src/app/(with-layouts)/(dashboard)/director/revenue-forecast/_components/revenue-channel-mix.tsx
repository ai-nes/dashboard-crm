"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import RevenueChartTooltip from "./chart-tooltip";
import { useRevenueForecastData } from "./revenue-forecast-context";

export default function RevenueChannelMix() {
  const { channelMix } = useRevenueForecastData();
  const CHANNEL_MIX = channelMix.items.map((item) => ({
    label: item.label,
    value: item.share,
  }));
  const top = channelMix.items.find(
    (item) => item.id === channelMix.topChannelId,
  );
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Nguồn người quan tâm</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Tỷ trọng người quan tâm theo kênh tuyển sinh
          </p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2 py-1 text-[11px] font-semibold text-badge-primary-text">
          {channelMix.totalLeads.toLocaleString("vi-VN")} người quan tâm
        </span>
      </CardHeader>

      <div
        className="mt-4 h-44 w-full"
        aria-label="Biểu đồ nguồn người quan tâm theo kênh"
      >
        <ChartContainer
          className="h-full w-full"
          height="100%"
          width="100%"
          minWidth={0}
          minHeight={0}
        >
          <BarChart
            data={CHANNEL_MIX}
            layout="vertical"
            margin={{ top: 0, right: 0, left: -8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border-color-base-100)"
              strokeDasharray="4 4"
              horizontal={false}
            />
            <XAxis type="number" domain={[0, 35]} hide />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={82}
              tick={{ fill: "var(--text-tertiary)", fontSize: 9 }}
            />
            <Tooltip
              content={<RevenueChartTooltip valueSuffix="%" />}
              cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }}
            />
            <Bar
              dataKey="value"
              name="Tỷ trọng"
              fill="var(--brand-500)"
              radius={[0, 4, 4, 0]}
              barSize={12}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4 text-[11px]">
        <span className="text-text-tertiary">Kênh hiệu quả nhất</span>
        <span className="font-semibold text-text-primary">
          {top ? `${top.label} · ${top.share}%` : "Chưa có dữ liệu"}
        </span>
      </div>
    </Card>
  );
}
