"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import { useAdmissionFunnelData } from "./admission-funnel-context";

const cohortColors = ["var(--primary-500)", "var(--info-500)", "var(--success-500)"];

export default function FunnelCohortChart() {
  const { cohorts } = useAdmissionFunnelData();
  const observedCohorts = cohorts.rows.filter((cohort) => cohort.values.every((value) => value !== null));
  const chartData = cohorts.followUpWeeks.map((week, index) => ({
    week: `Sau ${week} tuần`,
    ...Object.fromEntries(observedCohorts.map((cohort) => [cohort.label, cohort.values[index]])),
  }));

  return (
    <Card className="min-w-0 p-5 xl:h-full">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Tốc độ chuyển đổi theo tuần</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ tới bước đăng ký sau khi hồ sơ vào phễu.</p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">{cohorts.completeCohortCount} nhóm đủ {cohorts.followUpWeeks.length} tuần</span>
      </CardHeader>

      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary" aria-label="Chú thích nhóm theo tuần">
        {observedCohorts.map((cohort, index) => <span key={cohort.label} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ backgroundColor: cohortColors[index % cohortColors.length] }} />{cohort.label}</span>)}
      </div>

      <div className="h-64 w-full" role="img" aria-label="Biểu đồ tốc độ chuyển đổi của ba nhóm hồ sơ theo số tuần theo dõi">
        <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<CohortTooltip />} />
            {observedCohorts.map((cohort, index) => <Line key={cohort.label} name={cohort.label} type="monotone" dataKey={cohort.label} stroke={cohortColors[index % cohortColors.length]} strokeWidth={2.5} dot={{ r: 3, fill: cohortColors[index % cohortColors.length] }} activeDot={{ r: 5 }} />)}
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}

function CohortTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;

  return <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm"><p className="mb-2 font-semibold text-text-primary">{label}</p>{payload.map((item) => <p key={item.name} className="flex justify-between gap-5 py-0.5 text-text-secondary"><span>{item.name}</span><strong className="text-text-primary">{item.value?.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%</strong></p>)}</div>;
}
