"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoCurrency, formatDemoNumber } from "./acquisition-map-chart-card";
import { cohortEnrollmentDemo, contactLatencyDemo, cumulativeConversionDemo, costPerEnrolledDemo, enrollmentLagDemo, handoffSuccessDemo, submissionTimingDemo } from "./acquisition-map-demo";

const elapsedLabels = ["M0", "M1", "M2", "M3", "M4"];
const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const hourLabels = ["08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];

export function AcquisitionCohortPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <CohortEnrollmentChart />
      <EnrollmentLagChart />
      <CumulativeConversionChart />
      <ContactLatencyChart />
      <SubmissionTimingChart />
      <HandoffSuccessChart />
      <CostPerEnrolledChart />
    </div>
  );
}

function CohortEnrollmentChart() {
  return (
    <AcquisitionMapChartCard
      chartId="18"
      title="Cohort và tỷ lệ nhập học"
      description="Ma trận entry cohort × tháng trôi qua; cohort gần đây chưa đủ thời gian được để trống."
      badge="Rate %"
      className="xl:col-span-2"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left font-medium text-text-tertiary">Cohort vào</th>
              {elapsedLabels.map((label) => <th key={label} className="px-2 py-2 text-center font-medium text-text-tertiary">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {cohortEnrollmentDemo.map((row) => (
              <tr key={row.cohort}>
                <th scope="row" className="px-2 py-2 text-left font-medium text-text-secondary">{row.cohort}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.cohort}-${index}`} className="rounded-lg px-3 py-3 text-center font-semibold text-text-primary" style={{ backgroundColor: value === 0 ? "var(--background-gray-primary)" : cohortColor(value) }}>
                    {value === 0 ? "—" : `${value}%`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DemoNote>Không coi ô trống của cohort mới là conversion bằng 0.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function EnrollmentLagChart() {
  return (
    <AcquisitionMapChartCard
      chartId="19"
      title="Độ trễ đến nhập học"
      description="Histogram chỉ tính hồ sơ đã nhập học; đường median giúp đội tuyển sinh đọc tốc độ chuyển đổi."
      badge="Median 24 ngày"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={enrollmentLagDemo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" name="Số hồ sơ" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={30} />
          </BarChart>
        </ChartContainer>
      </div>
      <DemoNote>Median được lấy từ ngày submit đến ngày enrollment canonical, không lấy từ ngày cập nhật record.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function CumulativeConversionChart() {
  return (
    <AcquisitionMapChartCard
      chartId="20"
      title="Đường cong chuyển đổi cộng dồn"
      description="Step-area thể hiện conversion tích lũy qua mùa; chỉ dùng khi season đã hoàn tất."
      badge="Complete season"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={cumulativeConversionDemo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="acquisition-cumulative-conversion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.24} />
                <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip />
            <Area type="step" dataKey="value" name="Conversion cộng dồn" stroke="var(--success-500)" strokeWidth={2.5} fill="url(#acquisition-cumulative-conversion)" isAnimationActive={false} />
          </AreaChart>
        </ChartContainer>
      </div>
    </AcquisitionMapChartCard>
  );
}

function ContactLatencyChart() {
  return (
    <AcquisitionMapChartCard
      chartId="21"
      title="Thời gian đến lần liên hệ đầu"
      description="Box plot theo khung giờ submit, ẩn outlier khỏi thân chart để so median công bằng."
      badge="Median phút"
    >
      <div className="space-y-5 pt-2">
        {contactLatencyDemo.map((item) => (
          <div key={item.window} className="grid grid-cols-[54px_minmax(0,1fr)_54px] items-center gap-3">
            <span className="text-xs font-medium text-text-secondary">{item.window}</span>
            <div className="relative h-7">
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-background-gray-primary" />
              <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary-200" style={{ left: `${(item.min / 120) * 100}%`, width: `${((item.max - item.min) / 120) * 100}%` }} />
              <div className="absolute top-1/2 h-5 -translate-y-1/2 border-l border-info-500" style={{ left: `${(item.q1 / 120) * 100}%`, width: `${((item.q3 - item.q1) / 120) * 100}%` }} />
              <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500" style={{ left: `${(item.median / 120) * 100}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{item.median}m</span>
          </div>
        ))}
      </div>
      <DemoLegend items={[{ label: "Min–max", color: "bg-primary-200" }, { label: "Q1–Q3", color: "bg-info-500" }, { label: "Median", color: "bg-brand-500" }]} />
    </AcquisitionMapChartCard>
  );
}

function SubmissionTimingChart() {
  const maximum = Math.max(...submissionTimingDemo.flat());

  return (
    <AcquisitionMapChartCard
      chartId="22"
      title="Khung giờ gửi form"
      description="Calendar heatmap theo giờ địa phương để chọn thời điểm follow-up và phân bổ trực."
      badge="Timezone: Asia/Ho_Chi_Minh"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 text-left font-medium text-text-tertiary" />
              {hourLabels.map((hour) => <th key={hour} className="px-1 py-1 text-center font-medium text-text-tertiary">{hour}</th>)}
            </tr>
          </thead>
          <tbody>
            {submissionTimingDemo.map((row, rowIndex) => (
              <tr key={weekdayLabels[rowIndex]}>
                <th scope="row" className="px-1 py-2 text-left font-medium text-text-secondary">{weekdayLabels[rowIndex]}</th>
                {row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`} className="rounded-md px-1 py-2 text-center font-semibold text-text-primary" style={{ backgroundColor: timingColor(value, maximum) }}>{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AcquisitionMapChartCard>
  );
}

function HandoffSuccessChart() {
  return (
    <AcquisitionMapChartCard
      chartId="23"
      title="Handoff thành công theo nguồn"
      description="Bullet chart tách contacted và confirmed; success không đồng nghĩa chỉ moved to team."
      badge="Contacted + confirmed"
    >
      <div className="space-y-5 pt-2">
        {handoffSuccessDemo.map((item) => (
          <div key={item.source} className="grid grid-cols-[64px_minmax(0,1fr)_46px] items-center gap-3">
            <span className="text-xs font-medium text-text-secondary">{item.source}</span>
            <div className="relative h-3 rounded-full bg-background-gray-primary">
              <div className="absolute inset-y-0 left-0 rounded-full bg-success-500" style={{ width: `${item.success}%` }} />
              <span className="absolute inset-y-[-3px] w-px bg-text-primary/60" style={{ left: `${item.contacted}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{item.success}%</span>
          </div>
        ))}
      </div>
      <DemoLegend items={[{ label: "Success", color: "bg-success-500" }, { label: "Contacted marker", color: "bg-text-primary" }]} />
    </AcquisitionMapChartCard>
  );
}

function CostPerEnrolledChart() {
  const max = Math.max(...costPerEnrolledDemo.map((item) => item.cost));

  return (
    <AcquisitionMapChartCard
      chartId="24"
      title="Chi phí trên mỗi hồ sơ nhập học"
      description="Bảng ranking giữ cả nguồn miễn phí; chỉ dùng với season đã hoàn tất và cost allocation đầy đủ."
      badge="Nghìn đồng / enrolled"
      className="xl:col-span-2"
    >
      <div className="space-y-4">
        {costPerEnrolledDemo.map((item, index) => (
          <div key={item.source} className="grid grid-cols-[28px_84px_minmax(0,1fr)_84px_72px] items-center gap-3">
            <span className="text-xs font-semibold text-text-tertiary">{index + 1}</span>
            <span className="text-xs font-medium text-text-secondary">{item.source}</span>
            <div className="h-2 overflow-hidden rounded-full bg-background-gray-primary">
              <div className="h-full rounded-full bg-warning-500" style={{ width: `${max === 0 ? 0 : (item.cost / max) * 100}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{formatDemoCurrency(item.cost)}</span>
            <span className="text-right text-[11px] text-text-tertiary">{formatDemoNumber(item.enrolled)} hồ sơ</span>
          </div>
        ))}
      </div>
    </AcquisitionMapChartCard>
  );
}

function cohortColor(value: number): string {
  if (value >= 35) return "var(--brand-500)";
  if (value >= 25) return "var(--primary-200)";
  if (value >= 15) return "var(--primary-100)";
  return "var(--background-soft-100)";
}

function timingColor(value: number, maximum: number): string {
  const ratio = maximum === 0 ? 0 : value / maximum;
  if (ratio >= 0.75) return "var(--brand-500)";
  if (ratio >= 0.5) return "var(--primary-200)";
  if (ratio >= 0.25) return "var(--primary-100)";
  return "var(--background-soft-100)";
}
