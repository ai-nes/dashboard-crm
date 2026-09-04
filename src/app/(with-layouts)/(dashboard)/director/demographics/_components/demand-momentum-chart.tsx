"use client";

import { ArrowUpward } from "@tailgrids/icons";
import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { demandOverviewData as defaultDemand } from "@/services/api/demographics/data";
import type { DemandOverview } from "@/services/api/demographics/types";
import ChartEmptyState from "./chart-empty-state";
import { formatCountTick, formatRate, getCountAxisMax } from "./chart-utils";
import OverviewTooltip from "./overview-tooltip";

interface DemandMomentumChartProps {
  demand?: DemandOverview;
  period?: string;
}

const toneMap: Record<string, string> = {
  ai: "text-brand-500",
  software: "text-info-500",
  business: "text-success-500",
  design: "text-warning-500",
};

export default function DemandMomentumChart({ demand = defaultDemand, period }: DemandMomentumChartProps) {
  const trendData = demand?.trend ?? [];
  const summaryData = demand?.summary ?? [];
  const demandKeys = ["ai", "software", "business", "design"] as const;
  const demandValues = trendData.flatMap((point) => demandKeys.map((key) => point[key]));
  const hasTrendData = demandValues.some((value) => typeof value === "number" && Number.isFinite(value));
  const hasHistoricalData = trendData.slice(0, -1).some((point) =>
    demandKeys.some((key) => typeof point[key] === "number" && Number.isFinite(point[key]) && point[key] > 0),
  );
  const yAxisMax = getCountAxisMax(demandValues);
  const periodLabel = getPeriodLabel(period);

  const aiSummary = summaryData.find((item) => item.id === "ai");
  const isAiPositive = aiSummary?.change != null && aiSummary.change > 0;
  const aiBadgeText =
    aiSummary?.change != null
      ? `AI ${aiSummary.change >= 0 ? "tăng" : "giảm"} ${formatRate(Math.abs(aiSummary.change))}`
      : "AI chưa đủ dữ liệu so sánh";

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Xu hướng quan tâm theo ngành</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Số học sinh quan tâm đến từng ngành trong {periodLabel}.</p>
        </div>
        <Badge color={isAiPositive ? "success" : "gray"}>
          {isAiPositive && <ArrowUpward size={13} aria-hidden="true" />}
          {aiBadgeText}
        </Badge>
      </CardHeader>
      {summaryData.length > 0 ? (
        <div className="mb-4 grid grid-cols-2 gap-y-4 rounded-xl bg-card-background py-3 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-card-border">
          {summaryData.map((item) => {
            const valueText = item.value != null ? item.value.toLocaleString("vi-VN") : "-";
            const changeText = item.change != null ? `${item.change >= 0 ? "+" : ""}${item.change}%` : "-";
            return (
              <TrendSummary
                key={item.id}
                label={item.label}
                value={valueText}
                change={changeText}
                tone={item.change != null ? (toneMap[item.id] ?? "text-text-primary") : "text-text-tertiary"}
              />
            );
          })}
        </div>
      ) : (
        <div className="mb-4">
          <ChartEmptyState message="Chưa có số liệu tổng hợp theo ngành" />
        </div>
      )}
      <div className="h-64 w-full sm:h-80" aria-label="Biểu đồ xu hướng nhu cầu ngành học">
        {hasTrendData ? (
          <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
            <ComposedChart data={trendData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="demographic-ai-demand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} dy={10} />
              <YAxis domain={[0, yAxisMax]} tickCount={5} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={formatCountTick} />
              <Tooltip content={<OverviewTooltip />} />
              <Area type="monotone" dataKey="ai" name="Trí tuệ nhân tạo" stroke="var(--brand-500)" strokeWidth={2.5} fill="url(#demographic-ai-demand)" dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="software" name="Kỹ thuật phần mềm" stroke="var(--info-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="business" name="Kinh doanh" stroke="var(--success-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="design" name="Thiết kế" stroke="var(--warning-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <ChartEmptyState message="Chưa có dữ liệu xu hướng" detail="Cần dữ liệu theo thời gian thực để vẽ biểu đồ này." />
        )}
      </div>
      {hasTrendData && !hasHistoricalData ? (
        <p className="mt-3 rounded-lg border border-card-border bg-card-background px-3 py-2 text-xs leading-5 text-text-tertiary">
          Mới có dữ liệu ở kỳ gần nhất; chưa nên diễn giải đây là xu hướng tăng hoặc giảm.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-text-secondary" aria-hidden="true">
        <ChartLegendItem label="Trí tuệ nhân tạo" color="bg-brand-500" />
        <ChartLegendItem label="Kỹ thuật phần mềm" color="bg-info-500" />
        <ChartLegendItem label="Kinh doanh" color="bg-success-500" />
        <ChartLegendItem label="Thiết kế" color="bg-warning-500" />
      </div>
    </Card>
  );
}

function getPeriodLabel(period?: string): string {
  if (period === "season") return "toàn mùa";
  if (period === "12m") return "12 tháng gần đây";
  if (period === "6m") return "6 tháng gần đây";
  return period || "khoảng thời gian đã chọn";
}

function TrendSummary({ label, value, change, tone }: { label: string; value: string; change: string; tone: string }) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="text-sm font-semibold text-text-primary">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-[10px] font-semibold ${tone}`}>{change}</p>
    </div>
  );
}

function ChartLegendItem({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
