import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { demographicSegments } from "./data";
import type { DemographicSegment } from "./types";

interface SegmentScoreComparisonProps {
  segment: DemographicSegment;
}

const formatPercent = (value: number) => `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;

export default function SegmentScoreComparison({ segment }: SegmentScoreComparisonProps) {
  const benchmark = demographicSegments.find((item) => item.id !== segment.id && item.interest === segment.interest) ?? demographicSegments.find((item) => item.id !== segment.id) ?? demographicSegments[0];
  const metrics = [
    { label: "Đủ điều kiện tư vấn", current: (segment.qualified / segment.prospects) * 100, benchmark: (benchmark.qualified / benchmark.prospects) * 100 },
    { label: "Nộp hồ sơ", current: (segment.applications / segment.prospects) * 100, benchmark: (benchmark.applications / benchmark.prospects) * 100 },
    { label: "Nhập học", current: segment.conversion, benchmark: benchmark.conversion },
  ];

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background">
      <CardHeader className="mb-4">
        <div>
          <CardTitle>So sánh với nhóm tương tự</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ cao hơn cho thấy kết quả tốt hơn.</p>
          <p className="mt-1 text-xs text-text-tertiary">Đang xem: <span className="font-medium text-text-secondary">{segment.shortName}</span> · So sánh: <span className="font-medium text-text-secondary">{benchmark.shortName}</span></p>
        </div>
      </CardHeader>
      <div className="space-y-5">
        {metrics.map((metric) => <ComparisonRow key={metric.label} {...metric} />)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-card-border pt-4 text-xs text-text-tertiary">
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-brand-500" />Nhóm đang xem</span>
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-background-soft-300" />Nhóm so sánh</span>
      </div>
    </Card>
  );
}

interface ComparisonRowProps {
  label: string;
  current: number;
  benchmark: number;
}

function ComparisonRow({ label, current, benchmark }: ComparisonRowProps) {
  const max = Math.max(current, benchmark, 1);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <span className="text-sm font-semibold text-text-primary">{formatPercent(current)}</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(current / max) * 100}%` }} /></div>
        <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-background-soft-300" style={{ width: `${(benchmark / max) * 100}%` }} /></div>
      </div>
      <div className="mt-1.5 flex justify-between gap-3 text-[11px] text-text-tertiary"><span>Đang xem: {formatPercent(current)}</span><span>Nhóm so sánh: {formatPercent(benchmark)}</span></div>
    </div>
  );
}
