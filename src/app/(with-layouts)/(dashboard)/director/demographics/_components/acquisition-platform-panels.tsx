"use client";

import { Bar, CartesianGrid, ComposedChart, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoNumber } from "./acquisition-map-chart-card";
import {
  budgetByRoleDemo,
  dailySpendLeadsDemo,
  platformLeadCostDemo,
  sameSeasonDemo,
  touchpointPlatformDemo,
} from "./acquisition-map-demo";

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

function PlatformLeadCostChart() {
  return (
    <AcquisitionMapChartCard
      chartId="01"
      title="Lead và chi phí theo nền tảng"
      description="Đối chiếu số valid lead với CPL valid lead; referral được giữ lại dù không có spend."
      badge="CPL: nghìn đồng"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={platformLeadCostDemo} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis yAxisId="leads" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis yAxisId="cost" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}k`} />
            <Tooltip />
            <Bar yAxisId="leads" dataKey="validLeads" name="Valid lead" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={28} />
            <Line yAxisId="cost" dataKey="cpl" name="CPL" stroke="var(--warning-500)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--warning-500)" }} />
          </ComposedChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Valid lead", color: "bg-brand-500" }, { label: "CPL", color: "bg-warning-500" }]} />
    </AcquisitionMapChartCard>
  );
}

function SeasonComparisonChart() {
  return (
    <AcquisitionMapChartCard
      chartId="02"
      title="Nhịp lead so với cùng mùa"
      description="Slope comparison theo tuần tuyển sinh tương ứng, tránh so lệch lịch học."
      badge="Contact"
    >
      <div className="space-y-3 pt-1">
        {sameSeasonDemo.map((item) => {
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
  return (
    <AcquisitionMapChartCard
      chartId="03"
      title="Nhịp chi tiêu và lead hằng ngày"
      description="Hai sparkline tách nhau để đọc volume nhanh, không dùng kết luận chất lượng lead."
      badge="12 ngày"
    >
      <div className="space-y-5">
        <MiniTrend label="Spend" value={`${dailySpendLeadsDemo.reduce((sum, item) => sum + item.spend, 0)} triệu`} dataKey="spend" color="var(--warning-500)" />
        <MiniTrend label="Lead" value={formatDemoNumber(dailySpendLeadsDemo.reduce((sum, item) => sum + item.leads, 0))} dataKey="leads" color="var(--brand-500)" />
      </div>
      <DemoNote>Dữ liệu trình diễn. Khi nối API, giữ cùng timezone và ngày nghỉ/chiến dịch trong tooltip.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function MiniTrend({ label, value, dataKey, color }: { label: string; value: string; dataKey: string; color: string }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-center gap-3">
      <div>
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
      </div>
      <div className="h-14 min-w-0">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={dailySpendLeadsDemo} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ChartContainer>
      </div>
      <span className="text-[11px] text-text-tertiary">01 → 12</span>
    </div>
  );
}

function BudgetRoleChart() {
  return (
    <AcquisitionMapChartCard
      chartId="05"
      title="Phân bổ ngân sách theo vai trò"
      description="Một thanh 100% để kiểm tra bốn nhóm vai trò có phủ đủ ngân sách hay không."
      badge="100% budget"
    >
      <div className="pt-8">
        <div className="flex h-12 overflow-hidden rounded-lg bg-background-gray-primary">
          {budgetByRoleDemo.map((item, index) => (
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
      <DemoLegend items={budgetByRoleDemo.map((item, index) => ({ label: item.label, color: colorClass(index) }))} />
    </AcquisitionMapChartCard>
  );
}

function TouchpointPlatformChart() {
  const { columns, rows } = touchpointPlatformDemo;
  const maximum = Math.max(...rows.flatMap((row) => row.values));

  return (
    <AcquisitionMapChartCard
      chartId="04"
      title="Touchpoint × nền tảng"
      description="Heatmap volume lead theo loại touchpoint và nền tảng; cell mẫu quá nhỏ nên được làm mờ."
      badge="Heatmap"
      className="xl:col-span-2"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left font-medium text-text-tertiary">Touchpoint</th>
              {columns.map((column) => <th key={column} className="px-2 py-2 text-center font-medium text-text-tertiary">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="whitespace-nowrap px-2 py-3 text-left font-medium text-text-secondary">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.label}-${columns[index]}`} className="rounded-lg px-2 py-3 text-center font-semibold text-text-primary" style={{ backgroundColor: value < 10 ? "var(--background-gray-primary)" : heatColor(value, maximum) }}>
                    {value < 10 ? "—" : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DemoNote>Ẩn cell dưới 10 lead theo quy tắc Acquisition Map để tránh diễn giải mẫu quá nhỏ.</DemoNote>
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

function colorClass(index: number): string {
  return ["bg-brand-500", "bg-info-500", "bg-success-500", "bg-warning-500"][index] ?? "bg-brand-500";
}
