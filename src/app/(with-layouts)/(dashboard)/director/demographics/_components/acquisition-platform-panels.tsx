"use client";

import { Bar, CartesianGrid, ComposedChart, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { AcquisitionMapData } from "@/services/api/demographics/types";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoNumber } from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

const sourceColors = ["var(--brand-500)", "var(--info-500)", "var(--success-500)", "var(--warning-500)", "var(--error-500)"];

export function AcquisitionPlatformPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <PlatformLeadCostChart />
      <SeasonComparisonChart />
      <DailySpendLeadsChart />
      <BudgetRoleChart />
      <TouchpointPlatformChart />
    </div>
  );
}

export function PlatformLeadCostChart() {
  const { platformLeadCost } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="01"
      title="Lead hợp lệ và chi phí theo nền tảng"
      description="So sánh lead hợp lệ và chi phí cho mỗi lead hợp lệ."
      badge="Chi phí/lead hợp lệ · nghìn đồng"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={platformLeadCost} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis yAxisId="leads" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis yAxisId="cost" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => value === 0 ? "—" : `${value}k`} />
            <Tooltip content={<OverviewTooltip />} />
            <Bar yAxisId="leads" dataKey="validLeads" name="Lead hợp lệ (số lượng)" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={28} />
            <Line yAxisId="cost" dataKey="cpl" name="Chi phí/lead hợp lệ (nghìn đồng)" stroke="var(--warning-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--warning-500)" }} />
          </ComposedChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Lead hợp lệ", color: "bg-brand-500" }, { label: "Chi phí/lead hợp lệ", color: "bg-warning-500" }]} />
      <DemoNote>— = nguồn không có chi phí quảng cáo trực tiếp.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function SeasonComparisonChart() {
  const { leadTrendComparison } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="02"
      title="Lead mới so với cùng kỳ"
      description="So sánh số lead mới theo cùng tuần của hai mùa tuyển sinh."
      badge="Số lead mới"
    >
      <div className="space-y-3 pt-1">
        {leadTrendComparison.map((item) => {
          const max = Math.max(item.current, item.previous);
          return (
            <div key={item.week} className="grid grid-cols-[36px_minmax(0,1fr)_72px] items-center gap-3">
              <span className="text-xs font-medium text-text-tertiary">{item.week}</span>
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

function DailySpendLeadsChart() {
  const { dailySpendLeads } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="03"
      title="Chi tiêu quảng cáo và lead theo ngày"
      description="Đối chiếu chi tiêu quảng cáo với số lead thu được từng ngày."
      badge={`${dailySpendLeads.length} ngày`}
    >
      <div className="space-y-5">
        <MiniTrend label="Chi tiêu quảng cáo" value={`${dailySpendLeads.reduce((sum, item) => sum + item.spend, 0)} triệu`} data={dailySpendLeads} dataKey="spend" color="var(--warning-500)" />
        <MiniTrend label="Lead" value={formatDemoNumber(dailySpendLeads.reduce((sum, item) => sum + item.leads, 0))} data={dailySpendLeads} dataKey="leads" color="var(--brand-500)" />
      </div>
      <DemoNote>Chỉ dùng để xem độ trễ giữa chi tiêu và số lead; chưa kết luận hiệu quả.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function MiniTrend({ label, value, data, dataKey, color }: { label: string; value: string; data: AcquisitionMapData["dailySpendLeads"]; dataKey: string; color: string }) {
  const range = data.length > 0 ? `Ngày ${data[0]?.day}–${data[data.length - 1]?.day}` : "Chưa có dữ liệu";

  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-center gap-3">
      <div>
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
      </div>
      <div className="h-14 min-w-0">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ChartContainer>
      </div>
      <span className="text-[11px] text-text-tertiary">{range}</span>
    </div>
  );
}

function BudgetRoleChart() {
  const { budgetByPlatformRole } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="05"
      title="Cơ cấu ngân sách theo vai trò"
      description="Xem ngân sách đang phân bổ vào vai trò nào của nền tảng."
      badge="Tỷ trọng ngân sách"
    >
      <div className="pt-8">
        <div className="flex h-12 overflow-hidden rounded-lg bg-background-gray-primary">
          {budgetByPlatformRole.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-center px-2 text-xs font-semibold text-white-100 first:rounded-l-lg last:rounded-r-lg"
              style={{ backgroundColor: sourceColors[index], width: `${item.value}%` }}
            >
              {item.value}%
            </div>
          ))}
        </div>
      </div>
      <DemoLegend items={budgetByPlatformRole.map((item, index) => ({ label: item.label, color: colorClass(index) }))} />
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
      description="Số lead theo loại điểm chạm và nền tảng."
      badge="Số lead"
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
      <DemoNote>Ô dưới 10 lead được ẩn để tránh đọc sai tín hiệu nhỏ.</DemoNote>
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

function colorClass(index: number): string {
  return ["bg-brand-500", "bg-info-500", "bg-success-500", "bg-warning-500"][index] ?? "bg-brand-500";
}
