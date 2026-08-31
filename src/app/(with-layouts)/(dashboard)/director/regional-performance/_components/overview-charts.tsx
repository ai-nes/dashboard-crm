"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { FunnelStage, RegionPerformance } from "./types";

interface OverviewChartsProps {
  provinces: RegionPerformance[];
}

function OverviewCharts({ provinces }: OverviewChartsProps) {
  const targetData = useMemo(
    () =>
      [...provinces].sort((a, b) => b.targetAchievement - a.targetAchievement),
    [provinces],
  );
  const funnelData = useMemo(() => {
    const stages = provinces[0]?.funnel ?? [];
    return stages.map((stage, index) => ({
      stage: stage.stage,
      value: provinces.reduce(
        (total, province) => total + (province.funnel[index]?.value ?? 0),
        0,
      ),
    }));
  }, [provinces]);

  return (
    <section
      className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2"
      aria-label="Tổng quan hiệu suất 7 tỉnh"
    >
      <Card className="min-w-0 p-5">
        <CardHeader className="mb-4">
          <div>
            <CardTitle>Mức đạt chỉ tiêu theo tỉnh</CardTitle>
            <p className="mt-1 text-xs text-text-tertiary">
              Tỷ lệ hoàn thành mục tiêu tuyển sinh trong 7 tỉnh trọng điểm.
            </p>
          </div>
        </CardHeader>
        <div className="h-72 min-h-72 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={targetData}
              layout="vertical"
              margin={{ top: 4, right: 38, bottom: 4, left: 4 }}
              barCategoryGap={10}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--border-color-base-100)"
              />
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="name"
                width={112}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--background-soft-50)" }}
                content={<TargetTooltip />}
              />
              <Bar
                dataKey="targetAchievement"
                name="Đạt chỉ tiêu"
                fill="var(--primary-500)"
                radius={[0, 6, 6, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="targetAchievement"
                  position="right"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  formatter={(value) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="min-w-0 p-5">
        <CardHeader className="mb-4">
          <div>
            <CardTitle>Phễu tuyển sinh tổng quan</CardTitle>
            <p className="mt-1 text-xs text-text-tertiary">
              Tổng số hồ sơ còn lại sau từng bước của 7 tỉnh trọng điểm.
            </p>
          </div>
        </CardHeader>
        <div className="h-72 min-h-72 w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 4, right: 42, bottom: 4, left: 4 }}
              barCategoryGap={10}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--border-color-base-100)"
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="stage"
                width={112}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--background-soft-50)" }}
                content={<FunnelTooltip />}
              />
              <Bar
                dataKey="value"
                name="Số hồ sơ"
                fill="var(--success-500)"
                radius={[0, 6, 6, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString("vi-VN")
                      : String(value)
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </section>
  );
}

function TargetTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: RegionPerformance }[];
}) {
  const province = payload?.[0]?.payload;
  if (!active || !province) return null;
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="font-semibold text-text-primary">{province.name}</p>
      <p className="mt-1 text-text-secondary">
        Đạt chỉ tiêu: {province.targetAchievement}%
      </p>
      <p className="mt-1 text-text-secondary">
        Nhập học: {province.enrollments.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: FunnelStage }[];
}) {
  const stage = payload?.[0]?.payload;
  if (!active || !stage) return null;
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="font-semibold text-text-primary">{stage.stage}</p>
      <p className="mt-1 text-text-secondary">
        {stage.value.toLocaleString("vi-VN")} hồ sơ
      </p>
    </div>
  );
}

export default memo(OverviewCharts);
