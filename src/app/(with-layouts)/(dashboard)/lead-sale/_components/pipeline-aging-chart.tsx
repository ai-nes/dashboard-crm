"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import type { LeadSaleAgingBucket, LeadSaleDetailId, LeadSaleTone } from "./lead-sale-dashboard.types";
import PipelineAgingTooltip from "./pipeline-aging-tooltip";

interface PipelineAgingChartProps {
  buckets: LeadSaleAgingBucket[];
  actionRequiredCount: number;
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

export default function PipelineAgingChart({ buckets, actionRequiredCount, onOpenDetail }: PipelineAgingChartProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const criticalCount = buckets
    .filter((bucket) => bucket.id === "6-10-days" || bucket.id === "over-10-days")
    .reduce((sum, bucket) => sum + bucket.count, 0);
  const chartData = buckets.map((bucket) => {
    const percentage = total ? Math.round((bucket.count / total) * 100) : 0;
    return {
      ...bucket,
      percentage,
      displayValue: `${bucket.count} · ${percentage}%`,
    };
  });

  return (
    <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Thời gian ở giai đoạn hiện tại</CardTitle>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-text-tertiary">
            {total} hồ sơ đang xử lý, phân theo số ngày ở giai đoạn hiện tại để ưu tiên việc cần xử lý.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-semibold text-text-secondary">
          {total} hồ sơ đang xử lý
        </span>
      </CardHeader>

      <div
        className="mt-5 h-[250px] w-full"
        aria-label="Phân bổ hồ sơ theo thời gian nằm ở giai đoạn hiện tại"
      >
        <ChartContainer
          className="h-full w-full"
          height="100%"
          width="100%"
          minWidth={0}
          minHeight={0}
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 64, left: 4, bottom: 4 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--border-color-base-100)"
              strokeDasharray="4 4"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--background-soft-50)" }}
              content={<PipelineAgingTooltip />}
            />
            <Bar
              dataKey="count"
              name="Hồ sơ"
              barSize={28}
              radius={[0, 8, 8, 0]}
              isAnimationActive={false}
              onClick={(_, index) => {
                const bucket = buckets[index];
                if (bucket) onOpenDetail(bucket.detailId);
              }}
            >
              {chartData.map((bucket) => (
                <Cell key={bucket.id} fill={toneColor(bucket.tone)} />
              ))}
              <LabelList
                dataKey="displayValue"
                position="right"
                fill="var(--text-primary)"
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <Button
        type="button"
        variant="ghost"
        appearance="ghost"
        onPress={() => onOpenDetail("aging")}
        className="mt-4 h-auto w-full justify-between gap-4 rounded-xl bg-badge-warning-background/50 px-4 py-3 text-left text-xs hover:bg-badge-warning-background/70 sm:flex-row sm:items-center"
        aria-label="Xem các hồ sơ cần xử lý"
      >
        <span className="text-text-secondary">
          <strong className="font-semibold text-warning-700">{criticalCount}</strong> hồ sơ đã nằm ở giai đoạn từ 6 ngày trở lên.
        </span>
        <span className="shrink-0 font-semibold text-badge-error-text">
          {actionRequiredCount} hồ sơ cần xử lý · Xem hồ sơ →
        </span>
      </Button>
    </Card>
  );
}

function toneColor(tone: LeadSaleTone) {
  if (tone === "success") return "var(--success-500)";
  if (tone === "warning") return "var(--warning-500)";
  if (tone === "danger") return "var(--error-500)";
  if (tone === "violet") return "var(--badge-violet-text)";
  return "var(--primary-500)";
}
