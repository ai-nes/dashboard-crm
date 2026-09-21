"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import {
  getStudentStageLabel,
} from "@/components/segments/segment-filter-config";
import type { SaleStudentStages } from "@/services/api/sale";
import type { StudentStage } from "@/services/api/students/types";

import StudentStageTooltip from "./student-stage-tooltip";

interface StudentStageChartProps {
  data?: SaleStudentStages;
}

const stageOrder: StudentStage[] = [
  "New",
  "Attempting",
  "Connected",
  "Qualified",
  "Registration",
  "New Enter",
  "Disqualified",
];

const stageColors: Record<StudentStage, string> = {
  New: "var(--info-500)",
  Attempting: "var(--warning-500)",
  Connected: "var(--badge-violet-text)",
  Qualified: "var(--success-500)",
  Registration: "var(--primary-500)",
  "New Enter": "var(--success-500)",
  Disqualified: "var(--text-tertiary)",
};

export default function StudentStageChart({ data }: StudentStageChartProps) {
  const counts = new Map(data?.items.map((item) => [item.stage, item.count]));
  const total = data?.total ?? 0;
  const chartData = stageOrder.map((stage) => ({
    stage,
    label: getStudentStageLabel(stage),
    count: counts.get(stage) ?? 0,
    share: total > 0 ? ((counts.get(stage) ?? 0) / total) * 100 : 0,
    color: stageColors[stage],
  }));
  const hasData = total > 0 && chartData.some((item) => item.count > 0);

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Học sinh theo trạng thái CRM</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Phân bổ hiện tại theo trạng thái liên hệ, không phải tỷ lệ chuyển bước.
          </p>
        </div>
      </CardHeader>

      {hasData ? (
        <>
          <div
            className="mt-4 h-80 w-full"
            role="img"
            aria-label={`Biểu đồ phân bổ trạng thái CRM của ${total} học sinh`}
          >
            <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 28, bottom: 4, left: 0 }}
                barCategoryGap={14}
              >
                <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={108}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--background-soft-50)" }}
                  content={<StudentStageTooltip />}
                />
                <Bar dataKey="count" name="Học sinh" radius={[0, 5, 5, 0]} maxBarSize={24}>
                  {chartData.map((item) => <Cell key={item.stage} fill={item.color} />)}
                  <LabelList
                    dataKey="count"
                    position="right"
                    fill="var(--text-primary)"
                    fontSize={11}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <p className="mt-1 text-[11px] text-text-tertiary">
            {new Intl.NumberFormat("vi-VN").format(total)} học sinh trong phạm vi cá nhân.
          </p>
        </>
      ) : (
        <div className="mt-4 flex h-64 items-center justify-center rounded-lg bg-background-soft-50 px-4 text-center text-xs text-text-tertiary" role="status">
          Chưa có dữ liệu trạng thái CRM để phân bổ.
        </div>
      )}
    </Card>
  );
}
