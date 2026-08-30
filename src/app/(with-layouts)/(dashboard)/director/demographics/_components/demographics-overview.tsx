"use client";

import { toast } from "sonner";

import AudienceCompositionChart from "./audience-composition-chart";
import DataCoverageCard from "./data-coverage-card";
import DemandMomentumChart from "./demand-momentum-chart";
import EmergingSegments from "./emerging-segments";
import OverviewHeader from "./overview-header";
import OverviewKpiStrip from "./overview-kpi-strip";
import RegionalDemandHeatmap from "./regional-demand-heatmap";
import SegmentLandscapeChart from "./segment-landscape-chart";

interface DemographicsOverviewProps {
  onOpenSegment: (segmentId: string) => void;
}

export default function DemographicsOverview({ onOpenSegment }: DemographicsOverviewProps) {
  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden px-2 py-4 pb-8 lg:px-6">
      <OverviewHeader onExport={() => toast.success("Đã tạo báo cáo tổng quan người học.")} />
      <div className="min-w-0 max-w-full space-y-5">
        <OverviewKpiStrip />
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.72fr)]"><DemandMomentumChart /><AudienceCompositionChart /></div>
        <SegmentLandscapeChart onOpenSegment={onOpenSegment} />
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]"><RegionalDemandHeatmap /><DataCoverageCard /></div>
        <EmergingSegments onOpenSegment={onOpenSegment} />
      </div>
    </div>
  );
}
