"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import { AcquisitionAttributionPanels } from "./acquisition-attribution-panels";
import AcquisitionMapChartCard, { DemoLegend, DemoNote } from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

const qualityColors = ["var(--success-500)", "var(--warning-500)", "var(--error-500)", "var(--info-500)"];
const qualityClasses = ["bg-success-500", "bg-warning-500", "bg-error-500", "bg-info-500"];

export function AcquisitionQualityPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <QualityBySourceChart />
      <ValidRateTrendChart />
      <HandoffCompletenessChart />
      <AcquisitionAttributionPanels />
    </div>
  );
}
export function QualityBySourceChart() {
  const { leadQualityBySource } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="10"
      title="Chất lượng học sinh theo nguồn"
      description="Cơ cấu học sinh sau xác minh theo nguồn; trùng lặp được theo dõi riêng."
      badge="Trùng lặp tách riêng"
    >
      <div className="space-y-4 pt-2">
        {leadQualityBySource.map((item) => {
          const values = [item.valid, item.enrichment, item.invalid, item.outOfScope, item.duplicate];
          return (
            <div key={item.source} className="grid grid-cols-[64px_minmax(0,1fr)_94px] items-center gap-3">
              <span className="text-xs font-medium text-text-secondary">{item.source}</span>
              <div className="flex h-7 overflow-hidden rounded-md bg-background-gray-primary">
                {values.slice(0, 4).map((value, index) => <span key={`${item.source}-${index}`} style={{ backgroundColor: qualityColors[index], width: `${value}%` }} />)}
              </div>
              <span className="text-right text-[11px] font-semibold text-text-primary">Trùng lặp {item.duplicate}%</span>
            </div>
          );
        })}
      </div>
      <DemoLegend items={["Hợp lệ", "Cần bổ sung", "Sai thông tin", "Không đúng đối tượng"].map((label, index) => ({ label, color: qualityClasses[index] }))} />
      <DemoNote>Trùng lặp không cộng vào cơ cấu trên; hợp nhất vào hồ sơ cũ và ghi nhận thêm điểm chạm.</DemoNote>
    </AcquisitionMapChartCard>
  );
}
function ValidRateTrendChart() {
  const { validLeadRateTrend } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="11"
      title="Tỷ lệ học sinh hợp lệ theo thời gian"
      description="Theo dõi sớm nguồn có tỷ lệ học sinh hợp lệ giảm."
      badge="Tỷ lệ học sinh hợp lệ"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart
            data={validLeadRateTrend.map((item) => ({ week: item.week, ...item.values }))}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis domain={[0, 70]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<OverviewTooltip suffix="%" />} />
            <Line type="monotone" dataKey="Meta" stroke="var(--brand-500)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Google" stroke="var(--info-500)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="TikTok" stroke="var(--warning-500)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Giới thiệu" stroke="var(--success-500)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Meta", color: "bg-brand-500" }, { label: "Google", color: "bg-info-500" }, { label: "TikTok", color: "bg-warning-500" }, { label: "Giới thiệu", color: "bg-success-500" }]} />
    </AcquisitionMapChartCard>
  );
}

function HandoffCompletenessChart() {
  const { handoffDataCompleteness } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="12"
      title="Độ đầy đủ hồ sơ khi bàn giao"
      description="Tỷ lệ học sinh có đủ từng trường thông tin để tư vấn hiệu quả."
      badge="Học sinh đã bàn giao"
    >
      <div className="space-y-5 pt-2">
        {handoffDataCompleteness.map((item) => (
          <div key={item.field}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{item.field}</span>
              <span className="font-semibold text-text-primary">
                {item.value == null ? "—" : `${item.value}%`}
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-background-gray-primary">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
                style={{ width: `${item.value ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <DemoNote>Tỷ lệ = số học sinh có trường dữ liệu / tổng số học sinh đã bàn giao.</DemoNote>
    </AcquisitionMapChartCard>
  );
}
