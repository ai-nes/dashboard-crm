"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoCurrency, formatDemoNumber } from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

const elapsedLabels = ["Sau 0 tháng", "Sau 1 tháng", "Sau 2 tháng", "Sau 3 tháng", "Sau 4 tháng"];

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
  const { cohortEnrollmentMatrix } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="18"
      title="Tỷ lệ nhập học theo tháng vào hệ thống"
      description="So sánh tỷ lệ nhập học theo số tháng kể từ khi thu lead."
      badge="Tỷ lệ nhập học"
      className="xl:col-span-2"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left font-medium text-text-tertiary">Tháng vào hệ thống</th>
              {elapsedLabels.map((label) => <th key={label} className="px-2 py-2 text-center font-medium text-text-tertiary">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {cohortEnrollmentMatrix.map((row) => (
              <tr key={row.cohort}>
                <th scope="row" className="px-2 py-2 text-left font-medium text-text-secondary">{row.cohort}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.cohort}-${index}`} className="rounded-lg px-3 py-3 text-center font-semibold text-text-primary" style={{ backgroundColor: value == null ? "var(--background-gray-primary)" : cohortColor(value) }}>
                    {value == null ? "—" : `${value}%`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DemoNote>Dấu — = chưa đủ thời gian theo dõi, không phải kết quả bằng 0.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function EnrollmentLagChart() {
  const { enrollmentLagHistogram } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="19"
      title="Thời gian từ gửi biểu mẫu đến nhập học"
      description="Số ngày từ lúc gửi biểu mẫu đến khi học sinh nhập học."
      badge={`Trung vị: ${enrollmentLagHistogram.medianDays == null ? "—" : `${enrollmentLagHistogram.medianDays} ngày`}`}
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={enrollmentLagHistogram.buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <Tooltip content={<OverviewTooltip />} />
            <Bar dataKey="value" name="Số học sinh đã nhập học" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={30} />
          </BarChart>
        </ChartContainer>
      </div>
      <DemoNote>Chỉ tính học sinh đã nhập học; dùng trung vị từ ngày gửi biểu mẫu.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function CumulativeConversionChart() {
  const { cumulativeConversion } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="20"
      title="Tỷ lệ chuyển đổi tích lũy sau khi gửi biểu mẫu"
      description="Ước tính tỷ lệ nhập học cuối mùa từ dữ liệu giữa mùa."
      badge="Có mùa hoàn chỉnh"
    >
      <div className="h-64">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={cumulativeConversion} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="acquisition-cumulative-conversion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.24} />
                <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<OverviewTooltip suffix="%" />} />
            <Area type="step" dataKey="value" name="Tỷ lệ nhập học tích lũy" stroke="var(--success-500)" strokeWidth={2.5} fill="url(#acquisition-cumulative-conversion)" isAnimationActive={false} />
          </AreaChart>
        </ChartContainer>
      </div>
    </AcquisitionMapChartCard>
  );
}

export function ContactLatencyChart() {
  const { firstContactLatency } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="21"
      title="Thời gian từ gửi biểu mẫu đến liên hệ đầu tiên"
      description="Đo thời gian từ lúc thí sinh gửi biểu mẫu đến lần liên hệ đầu tiên."
      badge="Trung vị (phút)"
    >
      <div className="space-y-5 pt-2">
        {firstContactLatency.map((item) => (
          <div key={item.window} className="grid grid-cols-[54px_minmax(0,1fr)_54px] items-center gap-3">
            <span className="text-xs font-medium text-text-secondary">{item.window}</span>
            {item.min == null || item.q1 == null || item.median == null || item.q3 == null || item.max == null ? (
              <div className="text-xs text-text-tertiary">Chưa đủ dữ liệu</div>
            ) : (
              <div className="relative h-7">
                <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-background-gray-primary" />
                <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary-200" style={{ left: `${(item.min / 120) * 100}%`, width: `${((item.max - item.min) / 120) * 100}%` }} />
                <div className="absolute top-1/2 h-5 -translate-y-1/2 border-l border-info-500" style={{ left: `${(item.q1 / 120) * 100}%`, width: `${((item.q3 - item.q1) / 120) * 100}%` }} />
                <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500" style={{ left: `${(item.median / 120) * 100}%` }} />
              </div>
            )}
            <span className="text-right text-xs font-semibold text-text-primary">{item.median == null ? "—" : `${item.median} phút`}</span>
          </div>
        ))}
      </div>
      <DemoLegend items={[{ label: "Khoảng thấp nhất–cao nhất", color: "bg-primary-200" }, { label: "Khoảng 25%–75%", color: "bg-info-500" }, { label: "Trung vị", color: "bg-brand-500" }]} />
    </AcquisitionMapChartCard>
  );
}

function SubmissionTimingChart() {
  const { submissionTiming } = useAcquisitionMapData();
  const observedValues = submissionTiming.values.flat().filter(isObservedNumber);
  const maximum = Math.max(...observedValues, 0);

  return (
    <AcquisitionMapChartCard
      chartId="22"
      title="Khung giờ gửi biểu mẫu"
      description="Xác định lúc gửi biểu mẫu nhiều nhất để bố trí trực."
      badge="Giờ địa phương người gửi"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 text-left font-medium text-text-tertiary" />
              {submissionTiming.hours.map((hour) => <th key={hour} className="px-1 py-1 text-center font-medium text-text-tertiary">{hour}</th>)}
            </tr>
          </thead>
          <tbody>
            {submissionTiming.values.map((row, rowIndex) => (
              <tr key={submissionTiming.weekdays[rowIndex]}>
                <th scope="row" className="px-1 py-2 text-left font-medium text-text-secondary">{submissionTiming.weekdays[rowIndex]}</th>
                {row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`} className="rounded-md px-1 py-2 text-center font-semibold text-text-primary" style={{ backgroundColor: value == null ? "var(--background-gray-primary)" : timingColor(value, maximum) }}>{value == null ? "—" : value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AcquisitionMapChartCard>
  );
}

function HandoffSuccessChart() {
  const { handoffSuccessBySource } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="23"
      title="Tỷ lệ bàn giao thành công theo nguồn"
      description="Bàn giao thành công = đã liên hệ và xác nhận đúng đối tượng."
      badge="Tỷ lệ bàn giao"
    >
      <div className="space-y-5 pt-2">
        {handoffSuccessBySource.map((item) => (
          <div key={item.source} className="grid grid-cols-[64px_minmax(0,1fr)_46px] items-center gap-3">
            <span className="text-xs font-medium text-text-secondary">{item.source}</span>
            <div className="relative h-3 rounded-full bg-background-gray-primary">
              <div className="absolute inset-y-0 left-0 rounded-full bg-success-500" style={{ width: `${item.success ?? 0}%` }} />
              <span className="absolute inset-y-[-3px] w-px bg-text-primary/60" style={{ left: `${item.contacted ?? 0}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{item.success == null ? "—" : `${item.success}%`}</span>
          </div>
        ))}
      </div>
      <DemoLegend items={[{ label: "Bàn giao thành công", color: "bg-success-500" }, { label: "Đã liên hệ", color: "bg-text-primary" }]} />
    </AcquisitionMapChartCard>
  );
}

function CostPerEnrolledChart() {
  const { costPerEnrolledBySource } = useAcquisitionMapData();
  const max = Math.max(...costPerEnrolledBySource.map((item) => item.cost ?? 0), 0);

  return (
    <AcquisitionMapChartCard
      chartId="24"
      title="Chi phí trên mỗi học sinh nhập học"
      description="So sánh chi phí trung bình để có một học sinh nhập học."
      badge="Nghìn đồng / học sinh"
      className="xl:col-span-2"
    >
      <div className="space-y-4">
        {costPerEnrolledBySource.map((item, index) => (
          <div key={item.source} className="grid grid-cols-[28px_84px_minmax(0,1fr)_84px_72px] items-center gap-3">
            <span className="text-xs font-semibold text-text-tertiary">{index + 1}</span>
            <span className="text-xs font-medium text-text-secondary">{item.source}</span>
            <div className="h-2 overflow-hidden rounded-full bg-background-gray-primary">
              <div className="h-full rounded-full bg-warning-500" style={{ width: `${max === 0 || item.cost == null ? 0 : (item.cost / max) * 100}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{item.cost == null ? "—" : formatDemoCurrency(item.cost)}</span>
            <span className="text-right text-[11px] text-text-tertiary">{formatDemoNumber(item.enrolled)} học sinh</span>
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

function isObservedNumber(value: number | null): value is number {
  return value != null && Number.isFinite(value);
}
