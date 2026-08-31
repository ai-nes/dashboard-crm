"use client";

import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoNumber } from "./acquisition-map-chart-card";
import OverviewTooltip from "./overview-tooltip";
import { captureModeDemo, dropoffByFieldDemo, formCompletionDemo, formFunnelDemo } from "./acquisition-map-demo";

export function AcquisitionFormPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <FormFunnelChart />
      <FormCompletionChart />
      <FieldDropoffChart />
      <CaptureModeChart />
    </div>
  );
}

export function FormFunnelChart() {
  const firstValue = formFunnelDemo[0].value;

  return (
    <AcquisitionMapChartCard
      chartId="06"
      title="Phễu từ hiển thị đến bàn giao tư vấn"
      description="Xác định chặng có tỷ lệ chuyển bước thấp nhất."
      badge="Số lượng · tỷ lệ chuyển bước"
    >
      <div className="space-y-3">
        {formFunnelDemo.map((step, index) => (
          <div key={step.label} className="grid grid-cols-[92px_minmax(0,1fr)_64px] items-center gap-3">
            <span className="text-xs font-medium text-text-secondary">{step.label}</span>
            <div className="h-9 overflow-hidden rounded-md bg-background-gray-primary">
              <div className="flex h-full min-w-20 items-center rounded-md bg-brand-500 px-3 text-xs font-semibold text-white-100" style={{ width: `${Math.max(16, (step.value / firstValue) * 100)}%` }}>
                {formatDemoNumber(step.value)}
              </div>
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{index === 0 ? "—" : `${step.retention}%`}</span>
          </div>
        ))}
      </div>
    </AcquisitionMapChartCard>
  );
}

function FormCompletionChart() {
  return (
    <AcquisitionMapChartCard
      chartId="07"
      title="Tỷ lệ hoàn tất theo biểu mẫu"
      description="So sánh tỷ lệ hoàn tất giữa các biểu mẫu cùng mục đích."
      badge="Tỷ lệ hoàn tất"
    >
      <div className="space-y-4 pt-2">
        {formCompletionDemo.map((item) => (
          <div key={item.label} className="grid grid-cols-[minmax(110px,0.9fr)_minmax(0,1.5fr)_42px] items-center gap-3">
            <span className="truncate text-xs text-text-secondary">{item.label}</span>
            <div className="relative h-5">
              <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-card-border" />
              <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card-background bg-brand-500 shadow-[0_0_0_1px_var(--brand-500)]" style={{ left: `${item.value}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{item.value}%</span>
          </div>
        ))}
      </div>
      <DemoNote>Chỉ so sánh biểu mẫu cùng mục đích và cùng khoảng thời gian.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function FieldDropoffChart() {
  return (
    <AcquisitionMapChartCard
      chartId="08"
      title="Tỷ lệ bỏ dở theo trường thông tin"
      description="Xác định trường khiến người dùng dừng điền biểu mẫu."
      badge="Tỷ lệ bỏ dở"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={dropoffByFieldDemo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="field" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={44} />
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

function CaptureModeChart() {
  return (
    <AcquisitionMapChartCard
      chartId="09"
      title="Biểu mẫu nhúng và trang đích theo chiến dịch"
      description="So sánh tỷ lệ hoàn tất và tỷ lệ lead hợp lệ trong cùng chiến dịch."
      badge="Cùng chiến dịch"
    >
      <div className="space-y-6 pt-4">
        {captureModeDemo.map((item) => {
          const left = Math.min(item.validRate, item.completeRate);
          const right = Math.max(item.validRate, item.completeRate);
          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-text-secondary">{item.label}</span>
                <span className="text-xs text-text-tertiary">Hợp lệ {item.validRate}% · Hoàn tất {item.completeRate}%</span>
              </div>
              <div className="relative h-7">
                <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-background-gray-primary" />
                <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary-200" style={{ left: `${left}%`, width: `${right - left}%` }} />
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card-background bg-success-500 shadow-[0_0_0_1px_var(--success-500)]" style={{ left: `${item.validRate}%` }} />
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card-background bg-brand-500 shadow-[0_0_0_1px_var(--brand-500)]" style={{ left: `${item.completeRate}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <DemoLegend items={[{ label: "Tỷ lệ hợp lệ", color: "bg-success-500" }, { label: "Tỷ lệ hoàn tất", color: "bg-brand-500" }]} />
    </AcquisitionMapChartCard>
  );
}
