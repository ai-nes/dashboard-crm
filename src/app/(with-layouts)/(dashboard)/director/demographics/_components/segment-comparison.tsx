"use client";

import { ArrowUpward, ScaleSquare } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { demographicSegments } from "./data";
import type { DemographicSegment } from "./types";

export default function SegmentComparison({ segment }: { segment: DemographicSegment }) {
  const benchmark = demographicSegments.find((item) => item.id !== segment.id && item.interest === segment.interest) ?? demographicSegments.find((item) => item.id !== segment.id) ?? demographicSegments[0];
  const metrics = [
    { label: "Quy mô thị trường", current: segment.prospects, benchmark: benchmark.prospects, format: (value: number) => value.toLocaleString("vi-VN") },
    { label: "Tỷ lệ đủ điều kiện", current: (segment.qualified / segment.prospects) * 100, benchmark: (benchmark.qualified / benchmark.prospects) * 100, format: (value: number) => `${value.toFixed(1)}%` },
    { label: "Tỷ lệ nộp hồ sơ", current: (segment.applications / segment.prospects) * 100, benchmark: (benchmark.applications / benchmark.prospects) * 100, format: (value: number) => `${value.toFixed(1)}%` },
    { label: "Tỷ lệ nhập học", current: segment.conversion, benchmark: benchmark.conversion, format: (value: number) => `${value.toFixed(1)}%` },
    { label: "Học phí ròng", current: segment.tuition, benchmark: benchmark.tuition, format: (value: number) => `${value.toFixed(1)} tr` },
    { label: "Tăng trưởng MoM", current: segment.growth, benchmark: benchmark.growth, format: (value: number) => `+${value.toFixed(0)}%` },
  ];

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background p-0">
      <CardHeader className="border-b border-card-border p-5"><div><div className="flex flex-wrap items-center gap-2"><CardTitle>So sánh phân khúc</CardTitle><Badge color="primary"><ScaleSquare size={13} aria-hidden="true" />Benchmark trực tiếp</Badge></div><p className="mt-1 text-xs leading-5 text-text-tertiary">Đặt phân khúc hiện tại cạnh nhóm gần nhất để nhận biết khác biệt có ý nghĩa.</p></div></CardHeader>
      <div className="grid border-b border-card-border lg:grid-cols-2 lg:divide-x lg:divide-card-border">
        <SegmentSummary label="Phân khúc hiện tại" segment={segment} selected />
        <SegmentSummary label="Nhóm đối chứng" segment={benchmark} />
      </div>
      <div className="grid divide-y divide-card-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">{metrics.map((metric) => { const max = Math.max(metric.current, metric.benchmark, 1); const delta = metric.current - metric.benchmark; return <div key={metric.label} className="p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs text-text-tertiary">{metric.label}</p><span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${delta >= 0 ? "text-success-500" : "text-error-500"}`}>{delta >= 0 ? <ArrowUpward size={12} aria-hidden="true" /> : null}{delta >= 0 ? "+" : ""}{metric.format(Math.abs(delta))}</span></div><div className="mt-3 flex items-baseline justify-between gap-3"><strong className="text-lg text-text-primary">{metric.format(metric.current)}</strong><span className="text-sm text-text-tertiary">{metric.format(metric.benchmark)}</span></div><div className="mt-3 space-y-1.5"><div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(metric.current / max) * 100}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-text-tertiary" style={{ width: `${(metric.benchmark / max) * 100}%` }} /></div></div></div>; })}</div>
    </Card>
  );
}

function SegmentSummary({ label, segment, selected = false }: { label: string; segment: DemographicSegment; selected?: boolean }) {
  return <div className={`p-5 ${selected ? "bg-background-gray-primary" : "bg-card-background"}`}><p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">{label}</p><div className="mt-2 flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold leading-6 text-text-primary">{segment.name}</h3><p className="mt-1 text-xs text-text-tertiary">{segment.region} · {segment.interest}</p></div><Badge color={segment.growth >= 20 ? "success" : "gray"}>+{segment.growth}%</Badge></div></div>;
}
