"use client";

import { toast } from "sonner";

import SegmentAnalysis from "./segment-analysis";
import SegmentBuilder from "./segment-builder";
import SegmentComparison from "./segment-comparison";
import SegmentDetailCharts from "./segment-detail-charts";
import SegmentDetailHeader from "./segment-detail-header";
import SegmentGuardrails from "./segment-guardrails";
import SegmentKpiStrip from "./segment-kpi-strip";
import type { DemographicSegment, SegmentFilter } from "./types";

interface SegmentDetailDashboardProps {
  filters: SegmentFilter[];
  segment: DemographicSegment;
  onAddFilter: (filter: SegmentFilter) => void;
  onBack: () => void;
  onRemoveFilter: (id: string) => void;
  onResetFilters: () => void;
}

export default function SegmentDetailDashboard({ filters, segment, onAddFilter, onBack, onRemoveFilter, onResetFilters }: SegmentDetailDashboardProps) {
  return (
    <div className="mt-4 min-w-0 space-y-6 overflow-hidden pb-8">
      <SegmentDetailHeader segment={segment} onBack={onBack} onExport={() => toast.success("Đã tạo báo cáo chi tiết phân khúc.")} onSave={() => toast.success("Đã lưu phân khúc vào danh sách theo dõi.")} />
      <div className="space-y-5 px-2 lg:px-5">
        <SegmentBuilder filters={filters} onAdd={onAddFilter} onApply={() => toast.success(`Đã cập nhật phân tích cho ${filters.length} điều kiện.`)} onRemove={onRemoveFilter} onReset={onResetFilters} />
        <SegmentKpiStrip segment={segment} />
        <SegmentAnalysis segment={segment} />
        <SegmentDetailCharts segment={segment} />
        <SegmentComparison segment={segment} />
        <SegmentGuardrails />
      </div>
    </div>
  );
}
