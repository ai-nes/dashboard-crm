"use client";

import { ArrowUpward, ScaleSquare } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { demographicSegments } from "./data";
import type { DemographicSegment } from "./types";

interface ComparisonMetric {
  label: string;
  current: number;
  benchmark: number;
  formatValue: (value: number) => string;
  formatDelta: (value: number) => string;
  minorThreshold?: number;
}

export default function SegmentComparison({ segment }: { segment: DemographicSegment }) {
  const benchmark = demographicSegments.find((item) => item.id !== segment.id && item.interest === segment.interest) ?? demographicSegments.find((item) => item.id !== segment.id) ?? demographicSegments[0];
  const metrics: ComparisonMetric[] = [
    { label: "Số học sinh", current: segment.prospects, benchmark: benchmark.prospects, formatValue: (value) => value.toLocaleString("vi-VN"), formatDelta: (value) => value.toLocaleString("vi-VN") },
    { label: "Tỷ lệ đủ điều kiện", current: (segment.qualified / segment.prospects) * 100, benchmark: (benchmark.qualified / benchmark.prospects) * 100, formatValue: formatPercent, formatDelta: formatPoints, minorThreshold: 0.5 },
    { label: "Tỷ lệ nộp hồ sơ", current: (segment.applications / segment.prospects) * 100, benchmark: (benchmark.applications / benchmark.prospects) * 100, formatValue: formatPercent, formatDelta: formatPoints, minorThreshold: 0.5 },
    { label: "Tỷ lệ nhập học", current: segment.conversion, benchmark: benchmark.conversion, formatValue: formatPercent, formatDelta: formatPoints, minorThreshold: 0.5 },
    { label: "Học phí ròng", current: segment.tuition, benchmark: benchmark.tuition, formatValue: (value) => `${formatDecimal(value)} tr`, formatDelta: (value) => `${formatDecimal(value)} tr` },
    { label: "Tăng trưởng tháng", current: segment.growth, benchmark: benchmark.growth, formatValue: (value) => `${formatDecimal(value)}%`, formatDelta: formatPoints },
  ];

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background p-0">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2"><CardTitle>Kết quả so với nhóm tương tự</CardTitle><Badge color="primary"><ScaleSquare size={13} aria-hidden="true" />Nhóm so sánh</Badge></div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Chênh lệch theo từng chỉ số.</p>
        </div>
      </CardHeader>
      <div className="grid border-b border-card-border lg:grid-cols-2 lg:divide-x lg:divide-card-border">
        <SegmentSummary label="Nhóm đang xem" segment={segment} selected />
        <SegmentSummary label="Nhóm gần nhất" segment={benchmark} />
      </div>
      <div className="grid divide-y divide-card-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
        {metrics.map((metric) => <ComparisonMetricCard key={metric.label} metric={metric} />)}
      </div>
    </Card>
  );
}

function ComparisonMetricCard({ metric }: { metric: ComparisonMetric }) {
  const delta = metric.current - metric.benchmark;
  const isMinor = metric.minorThreshold !== undefined && Math.abs(delta) < metric.minorThreshold;
  const deltaTone = isMinor ? "text-text-tertiary" : delta > 0 ? "text-success-500" : delta < 0 ? "text-error-500" : "text-text-tertiary";
  const deltaText = delta === 0 ? "Không chênh lệch" : `${delta > 0 ? "+" : "−"}${metric.formatDelta(Math.abs(delta))}`;
  const max = Math.max(metric.current, metric.benchmark, 1);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">{metric.label}</p>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${deltaTone}`}>
          {!isMinor && delta > 0 ? <ArrowUpward size={12} aria-hidden="true" /> : null}
          {deltaText}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3"><strong className="text-lg text-text-primary">{metric.formatValue(metric.current)}</strong><span className="text-sm text-text-tertiary">{metric.formatValue(metric.benchmark)}</span></div>
      <div className="mt-3 space-y-1.5" aria-label={`${metric.label}: nhóm đang xem ${metric.formatValue(metric.current)}, nhóm gần nhất ${metric.formatValue(metric.benchmark)}`}>
        <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(metric.current / max) * 100}%` }} /></div>
        <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-background-soft-300" style={{ width: `${(metric.benchmark / max) * 100}%` }} /></div>
      </div>
    </div>
  );
}

function SegmentSummary({ label, segment, selected = false }: { label: string; segment: DemographicSegment; selected?: boolean }) {
  return <div className={`border-l-2 p-5 ${selected ? "border-brand-500 bg-badge-primary-background" : "border-transparent bg-background-gray-primary"}`}><p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">{label}</p><div className="mt-2 flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold leading-6 text-text-primary">{segment.name}</h3><p className="mt-1 text-xs text-text-tertiary">{segment.region} · {segment.interest}</p></div><Badge color={segment.growth >= 20 ? "success" : "gray"}>+{formatDecimal(segment.growth)}%</Badge></div></div>;
}

function formatDecimal(value: number) {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
}

function formatPercent(value: number) {
  return `${formatDecimal(value)}%`;
}

function formatPoints(value: number) {
  return `${formatDecimal(value)} điểm %`;
}
