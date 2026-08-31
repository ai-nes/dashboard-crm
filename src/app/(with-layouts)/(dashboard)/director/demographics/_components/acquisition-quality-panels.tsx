"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoNumber } from "./acquisition-map-chart-card";
import { handoffCompletenessDemo, identityMatchDemo, qualityBySourceDemo, validRateTrendDemo } from "./acquisition-map-demo";

const qualityColors = ["var(--success-500)", "var(--warning-500)", "var(--error-500)", "var(--info-500)", "var(--background-soft-300)"];
const qualityClasses = ["bg-success-500", "bg-warning-500", "bg-error-500", "bg-info-500", "bg-background-soft-300"];

export function AcquisitionQualityPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <QualityBySourceChart />
      <ValidRateTrendChart />
      <HandoffCompletenessChart />
      <IdentityMatchChart />
    </div>
  );
}

function QualityBySourceChart() {
  return (
    <AcquisitionMapChartCard
      chartId="10"
      title="Phân loại lead theo nguồn"
      description="Mỗi source phải phủ đủ các class disjoint; duplicate được giữ riêng để không mất touchpoint."
      badge="100% source"
    >
      <div className="space-y-4 pt-2">
        {qualityBySourceDemo.map((item) => {
          const values = [item.valid, item.enrichment, item.invalid, item.outOfScope, item.duplicate];
          return (
            <div key={item.source} className="grid grid-cols-[64px_minmax(0,1fr)_42px] items-center gap-3">
              <span className="text-xs font-medium text-text-secondary">{item.source}</span>
              <div className="flex h-7 overflow-hidden rounded-md bg-background-gray-primary">
                {values.map((value, index) => <span key={`${item.source}-${index}`} style={{ backgroundColor: qualityColors[index], width: `${value}%` }} />)}
              </div>
              <span className="text-right text-xs font-semibold text-text-primary">100%</span>
            </div>
          );
        })}
      </div>
      <DemoLegend items={["Valid", "Needs enrichment", "Invalid", "Out of scope", "Duplicate"].map((label, index) => ({ label, color: qualityClasses[index] }))} />
    </AcquisitionMapChartCard>
  );
}

function ValidRateTrendChart() {
  return (
    <AcquisitionMapChartCard
      chartId="11"
      title="Valid lead theo thời gian"
      description="Tối đa bốn source line để nhận ra cảnh báo chất lượng sớm mà không làm chart rối."
      badge="Rate %"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={validRateTrendDemo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis domain={[0, 70]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip />
            <Line type="monotone" dataKey="Meta" stroke="var(--brand-500)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Google" stroke="var(--info-500)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="TikTok" stroke="var(--warning-500)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Referral" stroke="var(--success-500)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Meta", color: "bg-brand-500" }, { label: "Google", color: "bg-info-500" }, { label: "TikTok", color: "bg-warning-500" }, { label: "Referral", color: "bg-success-500" }]} />
    </AcquisitionMapChartCard>
  );
}

function HandoffCompletenessChart() {
  return (
    <AcquisitionMapChartCard
      chartId="12"
      title="Độ đầy đủ dữ liệu khi handoff"
      description="Bullet list dùng denominator là các lead đã được handoff, không phải toàn bộ Contact."
      badge="Handoff denominator"
    >
      <div className="space-y-5 pt-2">
        {handoffCompletenessDemo.map((item) => (
          <div key={item.field}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{item.field}</span>
              <span className="font-semibold text-text-primary">{item.value}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-background-gray-primary">
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand-500" style={{ width: `${item.value}%` }} />
              <span className="absolute inset-y-[-2px] left-[80%] w-px bg-text-primary/50" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
      <DemoNote>Vạch dọc là mục tiêu dữ liệu 80%, không phải ngưỡng đạt chất lượng lead.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function IdentityMatchChart() {
  const max = Math.max(...identityMatchDemo.map((item) => item.value));

  return (
    <AcquisitionMapChartCard
      chartId="13"
      title="Cách thức resolve identity"
      description="So sánh số record theo cơ chế match và giữ riêng hàng confidence queue/unmatched."
      badge={`${formatDemoNumber(identityMatchDemo.reduce((sum, item) => sum + item.value, 0))} record`}
    >
      <div className="space-y-4 pt-2">
        {identityMatchDemo.map((item) => (
          <div key={item.label} className="grid grid-cols-[116px_minmax(0,1fr)_54px] items-center gap-3">
            <span className="truncate text-xs text-text-secondary">{item.label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-background-gray-primary">
              <div className="h-full rounded-full bg-info-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{formatDemoNumber(item.value)}</span>
          </div>
        ))}
      </div>
      <DemoNote>Confidence queue là hàng cần review, không tự động merge vào Contact canonical.</DemoNote>
    </AcquisitionMapChartCard>
  );
}
