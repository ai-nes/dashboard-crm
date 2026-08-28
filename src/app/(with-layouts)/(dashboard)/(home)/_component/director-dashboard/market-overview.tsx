"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { ArrowRight, ArrowUpward } from "@tailgrids/icons";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";

import DirectorChartTooltip from "./chart-tooltip";
import { marketOverview } from "./data";
import type { MetricTone } from "./types";

const TONE_STYLES: Record<MetricTone, { dot: string; bar: string; text: string }> = {
  primary: { dot: "bg-brand-500", bar: "var(--brand-500)", text: "text-brand-500" },
  info: { dot: "bg-blue-500", bar: "var(--info-500)", text: "text-blue-600" },
  success: { dot: "bg-success-500", bar: "var(--success-500)", text: "text-success-500" },
  warning: { dot: "bg-warning-500", bar: "var(--warning-500)", text: "text-warning-500" },
  danger: { dot: "bg-error-500", bar: "var(--error-500)", text: "text-error-500" },
};

const marketChartData = marketOverview.map((region) => ({
  ...region,
  shortName: region.id === "red-river" ? "ĐBS Hồng" : region.id === "mekong" ? "ĐBS Cửu Long" : region.name,
}));

const strongestRegion = marketOverview.reduce((best, region) =>
  region.coverage > best.coverage ? region : best,
);
const watchRegion = marketOverview.find((region) => region.growth.startsWith("-")) ?? marketOverview[0];

export default function MarketOverview() {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Tín hiệu thị trường</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Độ phủ đội ngũ và sức bật theo vùng tuyển sinh</p>
        </div>
        <Link
          href="/director/market-intelligence"
          className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
        >
          Mở bản đồ
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="mb-4 grid grid-cols-3 divide-x divide-card-border rounded-xl bg-card-background py-3">
        <MarketSummary label="Vùng theo dõi" value="6" />
        <MarketSummary label="Trường THPT" value="1,284" />
        <MarketSummary label="Mức khai thác" value="9.4%" />
      </div>

      <div className="rounded-xl border border-card-border bg-card-background px-2 pb-2 pt-3">
        <div className="mb-1 flex items-center justify-between px-2">
          <p className="text-xs font-semibold text-text-secondary">Độ phủ đội ngũ theo vùng</p>
          <span className="text-[11px] text-text-tertiary">Mục tiêu 80%</span>
        </div>
        <div className="h-48 w-full" aria-label="Biểu đồ độ phủ đội ngũ theo vùng">
          <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
            <BarChart
              layout="vertical"
              data={marketChartData}
              margin={{ top: 4, right: 22, left: 4, bottom: 0 }}
              barCategoryGap={12}
            >
              <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="shortName"
                width={92}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--background-gray-primary)", opacity: 0.5 }}
                content={<DirectorChartTooltip valueSuffix="%" />}
              />
              <Bar
                dataKey="coverage"
                name="Độ phủ đội ngũ"
                radius={[0, 6, 6, 0]}
                background={{ fill: "var(--background-gray-secondary)" }}
                maxBarSize={18}
                isAnimationActive={false}
              >
                {marketChartData.map((region) => (
                  <Cell key={region.id} fill={TONE_STYLES[region.tone].bar} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MarketSignal
          href={`/director/market-intelligence/${strongestRegion.id}`}
          label="Độ phủ tốt nhất"
          region={strongestRegion.name}
          value={`${strongestRegion.coverage}%`}
          tone="success"
        />
        <MarketSignal
          href={`/director/market-intelligence/${watchRegion.id}`}
          label="Cần ưu tiên"
          region={watchRegion.name}
          value={watchRegion.growth}
          tone="danger"
        />
      </div>

      <Link
        href="/director/market-intelligence"
        className="mt-4 flex items-center justify-between border-t border-card-border pt-3 text-xs text-text-tertiary hover:text-text-secondary"
      >
        <span>Phân tích 6 vùng · cập nhật 2 phút trước</span>
        <span className="inline-flex items-center gap-1 font-semibold text-brand-500">
          Xem chi tiết
          <ArrowRight size={13} aria-hidden="true" />
        </span>
      </Link>
    </Card>
  );
}

function MarketSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="text-sm font-semibold text-text-primary">{value}</p>
      <p className="mt-1 truncate text-[11px] text-text-tertiary">{label}</p>
    </div>
  );
}

function MarketSignal({
  href,
  label,
  region,
  value,
  tone,
}: {
  href: string;
  label: string;
  region: string;
  value: string;
  tone: "success" | "danger";
}) {
  const isPositive = tone === "success";

  return (
    <Link
      href={href}
      className="group min-w-0 rounded-xl border border-card-border bg-card-background p-3 transition-colors hover:border-badge-primary-text/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-text-primary">
          <span className={`size-1.5 shrink-0 rounded-full ${TONE_STYLES[tone].dot}`} aria-hidden="true" />
          <span className="truncate">{region}</span>
        </span>
        <span className={`shrink-0 text-sm font-semibold ${TONE_STYLES[tone].text}`}>
          {isPositive && <ArrowUpward size={12} className="mr-0.5 inline" aria-hidden="true" />}
          {value}
        </span>
      </div>
    </Link>
  );
}
