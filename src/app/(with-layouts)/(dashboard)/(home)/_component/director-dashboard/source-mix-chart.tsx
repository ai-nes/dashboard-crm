"use client";

import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { initialSourcePerformance } from "@/services/api/director-overview/data";
import { safeNumber, safePercentNumber } from "@/services/api/director-overview/normalizers";
import type { SourcePerformance } from "./types";

const SOURCE_COLORS: Record<string, string> = {
  facebook: "var(--brand-500)",
  "school-tour": "var(--warning-500)",
  zalo: "var(--info-500)",
  website: "var(--primary-300)",
  "open-day": "var(--success-500)",
};

interface SourceMixChartProps {
  sourcePerformance?: SourcePerformance[];
}

export default function SourceMixChart({ sourcePerformance = initialSourcePerformance }: SourceMixChartProps) {
  const items = sourcePerformance && sourcePerformance.length > 0 ? sourcePerformance : initialSourcePerformance;
  const totalLeads = items.reduce((sum, source) => sum + parseNumber(source.leads), 0);
  const maxLeads = Math.max(...items.map((source) => parseNumber(source.leads)), 1);

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Nguồn hồ sơ tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Kênh nào mang về nhiều hồ sơ và nhập học nhất.</p>
        </div>
        <Link
          href="/director/campaign-intelligence"
          className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
        >
          Xem chi tiết
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="space-y-3" aria-label="So sánh nguồn hồ sơ tuyển sinh">
        {items.map((source) => {
          const leads = parseNumber(source.leads);
          const width = maxLeads > 0 && leads > 0 ? Math.max(12, (leads / maxLeads) * 100) : 0;
          const color = SOURCE_COLORS[source.id] ?? "var(--brand-500)";
          const leadsLabel = `${formatNumber(source.leads)} hồ sơ`;
          const labelFitsInsideBar = width >= 36;

          return (
            <div
              key={source.id}
              className="grid gap-2 rounded-lg px-1 py-1.5 sm:grid-cols-[minmax(170px,0.9fr)_minmax(180px,2fr)_minmax(150px,0.8fr)] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{source.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{formatNumber(source.enrolled)} nhập học</p>
              </div>

              <div className="relative h-8 overflow-hidden rounded-md bg-background-gray-primary">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all"
                  style={{ width: `${width}%`, backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className={`relative flex h-full items-center px-3 text-xs font-semibold ${labelFitsInsideBar ? "text-white" : "text-text-primary"}`}>
                  {leadsLabel}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs sm:justify-end">
                <span className="text-text-tertiary">Tỷ trọng</span>
                <span className="font-semibold text-text-primary">{formatShare(source.share, source.leads, totalLeads)}</span>
              </div>
            </div>
          );
        })}
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

function formatShare(share: unknown, leads: unknown, totalLeads: number): string {
  const parsed = safePercentNumber(share, Number.NaN);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return `${parsed.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
  }
  if (totalLeads > 0) {
    const calculated = (parseNumber(leads) / totalLeads) * 100;
    return `${calculated.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
  }
  return "0%";
}
