"use client";

import { ArrowUpward } from "@tailgrids/icons";
import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { demandOverviewData as defaultDemand } from "@/services/api/demographics/data";
import type { DemandOverview } from "@/services/api/demographics/types";
import OverviewTooltip from "./overview-tooltip";

interface DemandMomentumChartProps {
  demand?: DemandOverview;
}

const toneMap: Record<string, string> = {
  ai: "text-brand-500",
  software: "text-info-500",
  business: "text-success-500",
  design: "text-warning-500",
};

export default function DemandMomentumChart({ demand = defaultDemand }: DemandMomentumChartProps) {
  const trendData = demand?.trend ?? [];
  const summaryData = demand?.summary ?? [];

  const aiSummary = summaryData.find((item) => item.id === "ai");
  const isAiPositive = aiSummary?.change != null && aiSummary.change > 0;
  const aiBadgeText =
    aiSummary?.change != null
      ? `AI ${aiSummary.change >= 0 ? "tăng" : "giảm"} ${Math.abs(aiSummary.change)}%`
      : "AI xu hướng";

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Xu hướng quan tâm theo ngành</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Số hồ sơ quan tâm trong 6 tháng gần đây.</p>
        </div>
        <Badge color={isAiPositive ? "success" : "gray"}>
          {isAiPositive && <ArrowUpward size={13} aria-hidden="true" />}
          {aiBadgeText}
        </Badge>
      </CardHeader>
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
      <div className="h-64 w-full sm:h-80" aria-label="Biểu đồ xu hướng nhu cầu ngành học">
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
            <YAxis domain={[1000, 3600]} ticks={[1000, 1800, 2600, 3400]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`} />
            <Tooltip content={<OverviewTooltip />} />
            <Area type="monotone" dataKey="ai" name="Trí tuệ nhân tạo" stroke="var(--brand-500)" strokeWidth={2.5} fill="url(#demographic-ai-demand)" dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="software" name="Kỹ thuật phần mềm" stroke="var(--info-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="business" name="Kinh doanh" stroke="var(--success-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="design" name="Thiết kế" stroke="var(--warning-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ChartContainer>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-text-secondary" aria-hidden="true">
        <ChartLegendItem label="Trí tuệ nhân tạo" color="bg-brand-500" />
        <ChartLegendItem label="Kỹ thuật phần mềm" color="bg-info-500" />
        <ChartLegendItem label="Kinh doanh" color="bg-success-500" />
        <ChartLegendItem label="Thiết kế" color="bg-warning-500" />
      </div>
    </Card>
  );
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
