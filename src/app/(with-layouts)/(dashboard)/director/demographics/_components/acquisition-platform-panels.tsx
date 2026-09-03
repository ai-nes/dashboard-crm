"use client";

import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoNumber } from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

export function AcquisitionPlatformPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <PlatformLeadCostChart />
      <SeasonComparisonChart />
      <TouchpointPlatformChart />
    </div>
  );
}
export function PlatformLeadCostChart() {
  const { platformLeadCost } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="01"
      title="Học sinh hợp lệ và chi phí theo nền tảng"
      description="So sánh số học sinh hợp lệ và chi phí cho mỗi học sinh hợp lệ."
      badge="Chi phí/học sinh hợp lệ · nghìn đồng"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={platformLeadCost} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis yAxisId="leads" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis yAxisId="cost" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => value === 0 ? "—" : `${value}k`} />
            <Tooltip content={<OverviewTooltip />} />
            <Bar yAxisId="leads" dataKey="validLeads" name="Học sinh hợp lệ (số lượng)" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={28} />
            <Line yAxisId="cost" dataKey="cpl" name="Chi phí/học sinh hợp lệ (nghìn đồng)" stroke="var(--warning-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--warning-500)" }} />
          </ComposedChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Học sinh hợp lệ", color: "bg-brand-500" }, { label: "Chi phí/học sinh hợp lệ", color: "bg-warning-500" }]} />
      <DemoNote>— = nguồn không có chi phí quảng cáo trực tiếp.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function SeasonComparisonChart() {
  const { leadTrendComparison } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="02"
      title="Học sinh mới so với cùng kỳ"
      description="So sánh số học sinh mới theo cùng tuần của hai mùa tuyển sinh."
      badge="Số học sinh mới"
    >
      <div className="space-y-3 pt-1">
        {leadTrendComparison.map((item) => {
          const max = Math.max(item.current, item.previous);
          return (
            <div key={item.week} className="grid grid-cols-[48px_minmax(0,1fr)_72px] items-center gap-3">
              <span className="whitespace-nowrap text-xs font-medium text-text-tertiary">{item.week}</span>
              <div className="relative h-7 rounded-md bg-background-gray-primary">
                <div className="absolute inset-y-1.5 rounded-full bg-background-soft-300" style={{ width: `${(item.previous / max) * 100}%` }} />
                <div className="absolute inset-y-1.5 rounded-full bg-brand-500" style={{ width: `${(item.current / max) * 100}%` }} />
              </div>
              <div className="text-right text-xs font-semibold text-text-primary">
                {formatDemoNumber(item.current)}
                <span className="ml-1 font-normal text-text-tertiary">/{formatDemoNumber(item.previous)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <DemoLegend items={[{ label: "Mùa này", color: "bg-brand-500" }, { label: "Mùa trước", color: "bg-background-soft-300" }]} />
    </AcquisitionMapChartCard>
  );
}
function TouchpointPlatformChart() {
  const { touchpointPlatformMatrix } = useAcquisitionMapData();
  const { columns, rows } = touchpointPlatformMatrix;
  const observedValues = rows.flatMap((row) => row.values).filter(isObservedNumber);
  const maximum = Math.max(...observedValues, 0);

  return (
    <AcquisitionMapChartCard
      chartId="04"
      title="Điểm chạm theo nền tảng"
      description="Số học sinh theo loại điểm chạm và nền tảng."
      badge="Số học sinh"
      className="xl:col-span-2"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left font-medium text-text-tertiary">Điểm chạm</th>
              {columns.map((column) => <th key={column} className="px-2 py-2 text-center font-medium text-text-tertiary">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="whitespace-nowrap px-2 py-3 text-left font-medium text-text-secondary">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.label}-${columns[index]}`} className="rounded-lg px-2 py-3 text-center font-semibold text-text-primary" style={{ backgroundColor: value == null || value < 10 ? "var(--background-gray-primary)" : heatColor(value, maximum) }}>
                    {value == null || value < 10 ? "—" : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DemoNote>Ô dưới 10 học sinh được ẩn để tránh đọc sai tín hiệu nhỏ.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function heatColor(value: number, maximum: number): string {
  const ratio = value / maximum;
  if (ratio >= 0.75) return "var(--brand-500)";
  if (ratio >= 0.5) return "var(--primary-200)";
  if (ratio >= 0.25) return "var(--primary-100)";
  return "var(--background-soft-100)";
}

function isObservedNumber(value: number | null): value is number {
  return value != null && Number.isFinite(value);
}
