"use client";

import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { sourcePerformance } from "./data";

const maxLeads = Math.max(...sourcePerformance.map((source) => parseNumber(source.leads)));

export default function SourceMixChart() {
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
        {sourcePerformance.map((source) => {
          const leads = parseNumber(source.leads);
          const width = Math.max(12, (leads / maxLeads) * 100);

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
                  className="flex h-full items-center rounded-md px-3 text-xs font-semibold text-white"
                  style={{ width: `${width}%`, backgroundColor: source.chartColor }}
                >
                  {formatNumber(source.leads)} hồ sơ
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs sm:justify-end">
                <span className="text-text-tertiary">Tỷ trọng</span>
                <span className="font-semibold text-text-primary">{source.share}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function parseNumber(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

function formatNumber(value: string) {
  return parseNumber(value).toLocaleString("vi-VN");
}
