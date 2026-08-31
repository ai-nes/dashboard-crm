"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { REGIONAL_SCOPE_LABEL } from "./data";
import type { FunnelStage, RegionPerformance } from "./types";

interface OverviewChartsProps {
  provinces: RegionPerformance[];
}

type OverviewFunnelStage = FunnelStage & {
  retainedRate: number;
  stepConversion: number;
  dropOff: number;
  previousStage?: string;
};

function OverviewCharts({ provinces }: OverviewChartsProps) {
  const targetData = useMemo(
    () =>
      [...provinces].sort((a, b) => b.targetAchievement - a.targetAchievement),
    [provinces],
  );
  const funnelData = useMemo(() => {
    const stages = provinces[0]?.funnel ?? [];
    const values = stages.map((stage, index) => ({
      stage: stage.stage,
      value: provinces.reduce(
        (total, province) => total + (province.funnel[index]?.value ?? 0),
        0,
      ),
    }));
    const initialValue = values[0]?.value ?? 0;

    return values.map((item, index) => {
      const previous = values[index - 1];
      const stepConversion = previous?.value
        ? (item.value / previous.value) * 100
        : 100;

      return {
        ...item,
        retainedRate: initialValue ? (item.value / initialValue) * 100 : 0,
        stepConversion,
        dropOff: index === 0 ? 0 : 100 - stepConversion,
        previousStage: previous?.stage,
      } satisfies OverviewFunnelStage;
    });
  }, [provinces]);
  const largestDrop = useMemo(
    () =>
      funnelData.slice(1).reduce<OverviewFunnelStage | undefined>(
        (largest, item) =>
          !largest || item.dropOff > largest.dropOff ? item : largest,
        undefined,
      ),
    [funnelData],
  );

  return (
    <section
      className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2"
      aria-label={`Tổng quan kết quả của ${REGIONAL_SCOPE_LABEL}`}
    >
      <Card className="min-w-0 p-5">
        <CardHeader className="mb-4">
          <div>
            <CardTitle>Tỷ lệ đạt chỉ tiêu theo địa bàn</CardTitle>
            <p className="mt-1 text-xs text-text-tertiary">
              Mốc đạt chỉ tiêu là 100%.
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
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={(value) => String(value) + "%"}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                height={20}
              />
              <ReferenceLine
                x={100}
                stroke="var(--text-tertiary)"
                strokeDasharray="4 4"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={124}
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
            <CardTitle>Hồ sơ còn lại theo giai đoạn</CardTitle>
            <p className="mt-1 text-xs text-text-tertiary">
              Tổng hồ sơ còn lại; % tính trên hồ sơ ban đầu.
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
              <XAxis
                type="number"
                hide
                domain={[0, funnelData[0]?.value ?? 0]}
              />
              <YAxis
                type="category"
                dataKey="stage"
                width={124}
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
        {largestDrop && (
          <p className="mt-3 rounded-lg bg-background-soft-50 px-3 py-2 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">
              Điểm giảm lớn nhất:
            </span>{" "}
            {largestDrop.previousStage} → {largestDrop.stage} giảm{" "}
            {largestDrop.dropOff.toFixed(1).replace(".", ",")}%, còn lại{" "}
            {largestDrop.value.toLocaleString("vi-VN")} hồ sơ.
          </p>
        )}
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
  payload?: { payload?: OverviewFunnelStage }[];
}) {
  const stage = payload?.[0]?.payload;
  if (!active || !stage) return null;
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="font-semibold text-text-primary">{stage.stage}</p>
      <p className="mt-1 text-text-secondary">
        {stage.value.toLocaleString("vi-VN")} hồ sơ
      </p>
      <p className="mt-1 text-text-secondary">
        Còn lại: {stage.retainedRate.toFixed(1).replace(".", ",")}%
      </p>
      {stage.previousStage && (
        <p className="mt-1 text-text-secondary">
          Sang bước này: {stage.stepConversion.toFixed(1).replace(".", ",")}%
        </p>
      )}
    </div>
  );
}

export default memo(OverviewCharts);
