"use client";

import { ArrowRight, ArrowUpward, CheckCircle1, Target3 } from "@tailgrids/icons";
import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";

import RevenueChartTooltip from "./chart-tooltip";
import { revenueScenarios } from "./data";

const TARGET_REVENUE = 520;

const SCENARIO_META: Record<string, Array<{ label: string; value: string; note: string }>> = {
  base: [
    { label: "Đòn bẩy", value: "Giữ nguyên", note: "không thay đổi chính sách" },
    { label: "Phạm vi", value: "Toàn hệ thống", note: "6 vùng tuyển sinh" },
    { label: "Thời gian", value: "Đang theo dõi", note: "cập nhật theo kỳ" },
    { label: "Mức ưu tiên", value: "Chuẩn", note: "không cần can thiệp" },
  ],
  "conversion-3": [
    { label: "Đòn bẩy", value: "Chăm sóc lại", note: "nhóm đủ điều kiện" },
    { label: "Phạm vi", value: "2,840 hồ sơ", note: "đã nộp, chưa nhập học" },
    { label: "Thời gian", value: "14 ngày", note: "chu kỳ tác động" },
    { label: "Mức ưu tiên", value: "Cao", note: "cần kích hoạt ngay" },
  ],
  "conversion-5": [
    { label: "Đòn bẩy", value: "Chiến dịch vùng", note: "tập trung vùng trọng điểm" },
    { label: "Phạm vi", value: "4,120 hồ sơ", note: "nhóm tiềm năng cao" },
    { label: "Thời gian", value: "21 ngày", note: "chu kỳ tác động" },
    { label: "Mức ưu tiên", value: "Rất cao", note: "cần phê duyệt ngân sách" },
  ],
};

export default function ScenarioSimulation() {
  const [selectedScenario, setSelectedScenario] = useState(revenueScenarios[1].id);
  const activeScenario = revenueScenarios.find((scenario) => scenario.id === selectedScenario) ?? revenueScenarios[0];
  const baseScenario = revenueScenarios[0];
  const achievement = Math.round((activeScenario.revenueValue / TARGET_REVENUE) * 100);
  const remainingGap = Math.max(TARGET_REVENUE - activeScenario.revenueValue, 0);
  const additionalEnrollment = activeScenario.enrollmentValue - baseScenario.enrollmentValue;
  const additionalRevenue = activeScenario.revenueValue - baseScenario.revenueValue;

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text">
              <Target3 size={15} aria-hidden="true" />
            </span>
            <CardTitle>Mô phỏng kịch bản</CardTitle>
          </div>
          <p className="mt-2 text-xs leading-5 text-text-tertiary">Thử các đòn bẩy tăng trưởng và xem ngay tác động đến chỉ tiêu</p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">Tương tác</span>
      </CardHeader>

      <div className="mt-5 grid grid-cols-1 items-stretch gap-2 sm:grid-cols-3" role="group" aria-label="Chọn kịch bản mô phỏng">
        {revenueScenarios.map((scenario) => {
          const isSelected = scenario.id === activeScenario.id;

          return (
            <Button
              key={scenario.id}
              variant="primary"
              appearance={isSelected ? "fill" : "outline"}
              size="sm"
              onPress={() => setSelectedScenario(scenario.id)}
              className={isSelected ? "h-[68px] min-h-0 w-full justify-start text-left" : "h-[68px] min-h-0 w-full justify-start border-card-border bg-card-background text-left"}
              aria-pressed={isSelected}
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{scenario.label}</span>
                <span className={`mt-1 block truncate text-[11px] ${isSelected ? "text-white-80" : "text-text-tertiary"}`}>
                  {scenario.impact}
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl bg-card-background p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">Kịch bản đang chọn</p>
              <h3 className="mt-2 truncate text-lg font-semibold text-text-primary">{activeScenario.label}</h3>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">{activeScenario.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-success-500">
                {additionalRevenue ? <ArrowUpward size={14} aria-hidden="true" /> : <CheckCircle1 size={14} aria-hidden="true" />}
                {additionalRevenue ? `+${additionalRevenue}B` : "Giữ nguyên"}
              </span>
              <p className="mt-1 text-[11px] text-text-tertiary">so với cơ sở</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
            <ScenarioMetric label="Nhập học dự kiến" value={activeScenario.enrollment} note="người" />
            <ScenarioMetric label="Doanh thu dự kiến" value={activeScenario.revenue} note="doanh thu thuần" tone="text-brand-500" />
            <ScenarioMetric label="Tăng thêm" value={`+${additionalEnrollment}`} note="người so với cơ sở" tone="text-success-500" />
            <ScenarioMetric label="Còn thiếu" value={`${remainingGap}B`} note={`${achievement}% chỉ tiêu`} tone={remainingGap ? "text-badge-warning-text" : "text-success-500"} />
          </div>

          <div className="mt-6 border-t border-card-border pt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] text-text-tertiary">
              <span>Tiến tới mục tiêu 520B</span>
              <span className="font-semibold text-text-secondary">{achievement}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary">
              <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300" style={{ width: `${Math.min(achievement, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-card-border bg-card-background p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-text-secondary">So sánh doanh thu dự kiến</p>
              <p className="mt-1 text-[11px] text-text-tertiary">Đường gạch là mục tiêu 520B</p>
            </div>
            <span className="rounded-full bg-badge-primary-background px-2 py-1 text-[11px] font-semibold text-badge-primary-text">Tỷ đồng</span>
          </div>
          <div className="mt-3 h-48 w-full" aria-label="Biểu đồ so sánh doanh thu theo kịch bản">
            <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
              <BarChart data={revenueScenarios} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
                  tickFormatter={(value: string) => (value === "Cơ sở" ? "Cơ sở" : value.replace("Tỷ lệ chuyển đổi ", ""))}
                />
                <YAxis hide domain={[0, 560]} />
                <ReferenceLine y={TARGET_REVENUE} stroke="var(--text-tertiary)" strokeDasharray="4 4" />
                <Tooltip content={<RevenueChartTooltip valueSuffix="B" />} cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }} />
                <Bar dataKey="revenueValue" name="Doanh thu dự kiến" radius={[6, 6, 0, 0]} maxBarSize={46} isAnimationActive={false}>
                  <LabelList dataKey="revenueValue" position="top" fill="var(--text-secondary)" fontSize={10} formatter={(value) => `${value}B`} />
                  {revenueScenarios.map((scenario) => (
                    <Cell key={scenario.id} fill={scenario.id === activeScenario.id ? "var(--brand-500)" : "var(--primary-200)"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />Kịch bản đang chọn</span>
            <span className="flex items-center gap-1.5"><span className="h-px w-4 border-t border-dashed border-text-tertiary" aria-hidden="true" />Mục tiêu</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-[114px] flex-1 items-center border-y border-card-border py-4">
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {(SCENARIO_META[activeScenario.id] ?? SCENARIO_META.base).map((item, index) => (
            <ScenarioMeta key={`${activeScenario.id}-${item.label}`} index={index} label={item.label} value={item.value} note={item.note} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <span className="flex items-center gap-1.5 text-text-tertiary">
          <CheckCircle1 size={14} className="text-badge-success-text" aria-hidden="true" />
          Dữ liệu mô phỏng niên khóa 2026
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-brand-500">
          Lưu kịch bản
          <ArrowRight size={13} aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

function ScenarioMetric({ label, value, note, tone = "text-text-primary" }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 truncate text-xl font-semibold tracking-[-0.6px] ${tone}`}>{value}</p>
      <p className="mt-1 truncate text-[11px] text-text-tertiary">{note}</p>
    </div>
  );
}

const SCENARIO_META_ACCENTS = [
  { dot: "bg-brand-500", value: "text-brand-500" },
  { dot: "bg-blue-500", value: "text-badge-sky-text" },
  { dot: "bg-violet-500", value: "text-badge-violet-text" },
  { dot: "bg-orange-400", value: "text-badge-warning-text" },
] as const;

function ScenarioMeta({ index, label, value, note }: { index: number; label: string; value: string; note: string }) {
  const accent = SCENARIO_META_ACCENTS[index] ?? SCENARIO_META_ACCENTS[0];

  return (
    <div className="h-[82px] min-w-0 rounded-xl bg-card-background px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`size-1.5 shrink-0 rounded-full ${accent.dot}`} aria-hidden="true" />
        <p className="truncate text-[11px] text-text-tertiary">{label}</p>
      </div>
      <p className={`mt-1 truncate text-sm font-semibold ${accent.value}`}>{value}</p>
      <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-text-tertiary">{note}</p>
    </div>
  );
}
