import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { initialMarketOverview } from "@/services/api/director-overview/data";
import { safeNumber, safePercentNumber } from "@/services/api/director-overview/normalizers";
import type { MarketOverviewItem, MetricTone } from "./types";

const TONE_STYLES: Record<MetricTone, { bar: string; text: string }> = {
  primary: { bar: "var(--brand-500)", text: "text-brand-500" },
  info: { bar: "var(--info-500)", text: "text-info-500" },
  success: { bar: "var(--success-500)", text: "text-success-500" },
  warning: { bar: "var(--warning-500)", text: "text-warning-500" },
  danger: { bar: "var(--error-500)", text: "text-error-500" },
};

interface MarketOverviewProps {
  marketOverview?: MarketOverviewItem[];
}

export default function MarketOverview({ marketOverview = initialMarketOverview }: MarketOverviewProps) {
  const items = marketOverview && marketOverview.length > 0 ? marketOverview : initialMarketOverview;
  const rankedRegions = [...items].sort((first, second) => parseNumber(second.prospects) - parseNumber(first.prospects));
  const maxProspects = Math.max(...rankedRegions.map((region) => parseNumber(region.prospects)), 1);

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Kết quả tuyển sinh theo vùng</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh quy mô hồ sơ và tỷ lệ nhập học.</p>
        </div>
        <Link href="/director/market-intelligence" className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
          Xem bản đồ
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="grid grid-cols-[minmax(0,1fr)_64px_64px_52px] gap-3 border-b border-card-border px-3 pb-2 text-[10px] font-semibold tracking-wide text-text-tertiary uppercase sm:grid-cols-[minmax(0,1fr)_72px_72px_58px]">
        <span>Vùng tuyển sinh</span>
        <span className="text-right">Hồ sơ</span>
        <span className="text-right">Nhập học</span>
        <span className="text-right">Tỷ lệ</span>
      </div>

      <div className="mt-3 space-y-2">
        {rankedRegions.map((region, index) => {
          const prospects = parseNumber(region.prospects);
          const enrolled = parseNumber(region.enrolled);
          const isDeclining = isGrowthNegative(region.growth);
          const tone = (region.tone && TONE_STYLES[region.tone]) ?? TONE_STYLES.primary;
          const coverage = safePercentNumber(region.coverage, 0);
          const widthPercent = prospects > 0 ? (prospects / maxProspects) * 100 : 0;

          return (
            <div key={region.id} className={`rounded-xl border p-3 ${isDeclining ? "border-badge-error-text/30 bg-badge-error-background/30" : "border-card-border bg-card-background"}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_64px_64px_52px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_72px_72px_58px]">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-background-gray-primary text-[11px] font-semibold text-text-tertiary">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-text-primary sm:text-sm">{region.name}</p>
                    <p className={`mt-0.5 truncate text-[10px] font-medium ${isDeclining ? "text-error-500" : "text-text-tertiary"}`}>{formatGrowth(region.growth)} · Độ phủ {coverage}%</p>
                  </div>
                </div>
                <span className="text-right text-xs font-semibold text-text-primary">{formatNumber(region.prospects)}</span>
                <span className="text-right text-xs font-semibold text-text-primary">{formatNumber(region.enrolled)}</span>
                <span className={`text-right text-xs font-semibold ${tone.text}`}>{formatPercent(region.conversion, prospects, enrolled)}</span>
              </div>
              <div className="mt-2 ml-8 h-1.5 overflow-hidden rounded-full bg-background-gray-secondary">
                <div className="h-full rounded-full transition-all" style={{ width: `${widthPercent}%`, backgroundColor: tone.bar }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-card-border pt-4 text-[11px] text-text-tertiary">
        <span>Thanh dài hơn = nhiều hồ sơ hơn</span>
        <Link href="/director/market-intelligence" className="shrink-0 font-semibold text-brand-500 hover:text-brand-600">Phân tích địa bàn</Link>
      </div>
    </Card>
  );
}

function parseNumber(value: unknown): number {
  return safeNumber(value);
}

function formatNumber(value: unknown): string {
  return parseNumber(value).toLocaleString("vi-VN");
}

function parsePercentValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = safePercentNumber(value, Number.NaN);
  return Number.isFinite(number) ? number : null;
}

function formatPercent(value: unknown, prospects?: unknown, enrolled?: unknown): string {
  const parsed = parsePercentValue(value);
  if (parsed !== null) {
    return `${parsed.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
  }
  const p = parseNumber(prospects);
  const e = parseNumber(enrolled);
  if (p > 0) {
    const rate = (e / p) * 100;
    return `${rate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
  }
  return "0%";
}

function formatGrowth(value: unknown): string {
  const parsed = parsePercentValue(value);
  if (parsed === null || parsed === 0) {
    return "0% tăng trưởng";
  }
  const prefix = parsed > 0 ? "+" : "";
  return `${prefix}${parsed.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% tăng trưởng`;
}

function isGrowthNegative(value: unknown): boolean {
  const parsed = parsePercentValue(value);
  if (parsed !== null) return parsed < 0;
  if (typeof value === "string") return value.trim().startsWith("-");
  return false;
}
