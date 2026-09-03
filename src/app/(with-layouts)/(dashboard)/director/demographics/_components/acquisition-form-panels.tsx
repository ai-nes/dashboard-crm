"use client";

import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, formatDemoNumber } from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

export function AcquisitionFormPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <FormFunnelChart />
      <FieldDropoffChart />
    </div>
  );
}
export function FormFunnelChart() {
  const { formFunnel } = useAcquisitionMapData();
  const firstValue = formFunnel[0]?.value ?? 0;

  return (
    <AcquisitionMapChartCard
      chartId="06"
      title="Phễu từ hiển thị đến bàn giao tư vấn"
      description="Xác định chặng có tỷ lệ chuyển bước thấp nhất."
      badge="Số lượng · tỷ lệ chuyển bước"
    >
      <div className="space-y-3">
        {formFunnel.map((step, index) => (
          <div key={step.label} className="grid grid-cols-[92px_minmax(0,1fr)_64px] items-center gap-3">
            <span className="text-xs font-medium text-text-secondary">{step.label}</span>
            <div className="h-9 overflow-hidden rounded-md bg-background-gray-primary">
              <div className="flex h-full min-w-20 items-center rounded-md bg-brand-500 px-3 text-xs font-semibold text-white-100" style={{ width: `${firstValue === 0 ? 0 : Math.max(16, (step.value / firstValue) * 100)}%` }}>
                {formatDemoNumber(step.value)}
              </div>
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{index === 0 || step.retention == null ? "—" : `${step.retention}%`}</span>
          </div>
        ))}
      </div>
    </AcquisitionMapChartCard>
  );
}
function FieldDropoffChart() {
  const { formDropoffByField } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="08"
      title="Tỷ lệ bỏ dở theo trường thông tin"
      description="Xác định trường khiến người dùng dừng điền biểu mẫu."
      badge="Tỷ lệ bỏ dở"
    >
      <div className="h-72">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={formDropoffByField} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="field" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={60} />
            <YAxis yAxisId="dropoff" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <YAxis yAxisId="cumulative" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<OverviewTooltip suffix="%" />} />
            <Bar yAxisId="dropoff" dataKey="dropoff" name="Tỷ lệ bỏ dở tại trường" fill="var(--warning-500)" radius={[5, 5, 0, 0]} barSize={28} />
            <Line yAxisId="cumulative" dataKey="cumulative" name="Tỷ lệ bỏ dở cộng dồn" stroke="var(--brand-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--brand-500)" }} />
          </ComposedChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Tại từng trường", color: "bg-warning-500" }, { label: "Cộng dồn", color: "bg-brand-500" }]} />
    </AcquisitionMapChartCard>
  );
}
