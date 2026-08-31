"use client";

import { toast } from "sonner";

import type {
  DemographicSegment,
  DirectorDemographicsSegmentData,
} from "@/services/api/demographics/types";
import SegmentAnalysis from "./segment-analysis";
import SegmentComparison from "./segment-comparison";
import SegmentDetailCharts from "./segment-detail-charts";
import SegmentDetailHeader from "./segment-detail-header";
import SegmentGuardrails from "./segment-guardrails";
import SegmentNextAction from "./segment-next-action";

interface SegmentDetailDashboardProps {
  segment: DemographicSegment;
  detailData?: DirectorDemographicsSegmentData | null;
  onBack: () => void;
}

export default function SegmentDetailDashboard({
  segment,
  detailData,
  onBack,
}: SegmentDetailDashboardProps) {
  const currentSegment = detailData?.segment ?? segment;
  const benchmark = detailData?.benchmark;
  const nextAction = detailData?.nextAction;
  const guardrails = detailData?.guardrails;

  return (
    <div className="mt-4 min-w-0 space-y-6 overflow-hidden pb-8">
      <SegmentDetailHeader
        segment={currentSegment}
        onBack={onBack}
        onExport={() => toast.success("Đã tạo báo cáo chi tiết phân khúc.")}
        onSave={() => toast.success("Đã lưu phân khúc vào danh sách theo dõi.")}
      />
      <div className="space-y-5 px-2 lg:px-5">
        <SegmentAnalysis segment={currentSegment} />
        <SegmentNextAction segment={currentSegment} nextAction={nextAction} />
        <SegmentDetailCharts segment={currentSegment} benchmark={benchmark} />
        <SegmentComparison segment={currentSegment} benchmark={benchmark} />
        <SegmentGuardrails guardrails={guardrails} />
      </div>
    </div>
  );
}
