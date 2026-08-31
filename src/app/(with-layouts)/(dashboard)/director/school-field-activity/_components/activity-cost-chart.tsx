"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { CompletedFieldActivity } from "@/services/api/director-school-field-activity";

interface ActivityCostChartProps {
  activities: CompletedFieldActivity[];
}

function CostTooltip({ active, label, payload }: { active?: boolean; label?: string; payload?: Array<{ value?: number }> }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="mt-1 text-text-secondary">{payload[0]?.value?.toFixed(1).replace(".", ",")} triệu đồng/học sinh</p>
    </div>
  );
}

export default function ActivityCostChart({ activities }: ActivityCostChartProps) {
  const chartData = activities
    .map((activity) => ({
      name: activity.shortName,
      cost: toMillionVnd(activity.costPerEnrollment.amount, activity.costPerEnrollment.unit),
    }))
    .filter((activity): activity is { name: string; cost: number } => activity.cost !== null)
    .sort((first, second) => first.cost - second.cost);

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Chi phí cho mỗi học sinh nhập học</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Chi phí thấp hơn cho thấy hoạt động hiệu quả hơn về ngân sách.</p>
        </div>
      </CardHeader>

      <div className="h-[300px] w-full min-w-0">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 4 }} barCategoryGap="28%">
            <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value: number) => `${value} tr`} />
            <YAxis type="category" dataKey="name" width={122} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
            <Tooltip content={<CostTooltip />} cursor={{ fill: "var(--background-soft-50)" }} />
            <Bar name="Chi phí" dataKey="cost" fill="var(--primary-500)" radius={[0, 5, 5, 0]} barSize={18}>
              <LabelList dataKey="cost" position="right" formatter={(value) => {
                const numericValue = typeof value === "number" ? value : Number(value);
                return Number.isFinite(numericValue) ? `${numericValue.toFixed(1).replace(".", ",")} tr` : "";
              }} fill="var(--text-secondary)" fontSize={11} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}

function toMillionVnd(amount: number | null, unit: CompletedFieldActivity["costPerEnrollment"]["unit"]): number | null {
  if (amount === null) return null;
  if (unit === "vnd") return amount / 1_000_000;
  if (unit === "thousand_vnd") return amount / 1_000;
  return amount;
}
