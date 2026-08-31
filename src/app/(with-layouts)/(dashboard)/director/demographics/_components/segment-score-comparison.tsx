import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import ChartEmptyState from "./chart-empty-state";
import { formatRate, safeRate } from "./chart-utils";
import type { DemographicSegment } from "./types";

interface SegmentScoreComparisonProps {
  segment: DemographicSegment;
  benchmark?: DemographicSegment;
}

export default function SegmentScoreComparison({ segment, benchmark }: SegmentScoreComparisonProps) {
  if (!benchmark) {
    return (
      <Card className="min-w-0 overflow-hidden bg-card-background">
        <CardHeader className="mb-4">
          <div>
            <CardTitle>So với nhóm tương tự</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">Chưa có nhóm để đối chiếu.</p>
          </div>
        </CardHeader>
        <ChartEmptyState message="Chưa có nhóm so sánh" detail="Cần thêm một nhóm cùng kỳ để đối chiếu." />
      </Card>
    );
  }

  const metrics = [
    { label: "Đủ điều kiện tư vấn", current: safeRate(segment.qualified, segment.prospects), benchmark: safeRate(benchmark.qualified, benchmark.prospects) },
    { label: "Tỷ lệ nộp hồ sơ", current: safeRate(segment.applications, segment.prospects), benchmark: safeRate(benchmark.applications, benchmark.prospects) },
    { label: "Nhập học", current: segment.conversion, benchmark: benchmark.conversion },
  ];

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background">
      <CardHeader className="mb-4">
        <div>
        <CardTitle>So với nhóm tương tự</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Thanh dài hơn = tỷ lệ cao hơn.</p>
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
  current: number | null;
  benchmark: number | null;
}

function ComparisonRow({ label, current, benchmark }: ComparisonRowProps) {
  const max = Math.max(current ?? 0, benchmark ?? 0, 1);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <span className="text-sm font-semibold text-text-primary">{formatRate(current)}</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-brand-500" style={{ width: `${((current ?? 0) / max) * 100}%` }} /></div>
        <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className="h-full rounded-full bg-background-soft-300" style={{ width: `${((benchmark ?? 0) / max) * 100}%` }} /></div>
      </div>
      <div className="mt-1.5 flex justify-between gap-3 text-[11px] text-text-tertiary"><span>Đang xem: {formatRate(current)}</span><span>Nhóm so sánh: {formatRate(benchmark)}</span></div>
    </div>
  );
}
