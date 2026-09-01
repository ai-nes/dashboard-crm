"use client";

import type {
  DemographicsFilterOptions,
  DirectorDemographicsOverviewData,
  DirectorDemographicsOverviewMeta,
  DirectorDemographicsOverviewParams,
} from "@/services/api/demographics/types";
import AudienceCompositionChart from "./audience-composition-chart";
import AcquisitionMapWorkspace from "./acquisition-map-workspace";
import DataCoverageCard from "./data-coverage-card";
import DemographicsFilterPopover from "./demographics-filter-popover";
import OverviewHeader from "./overview-header";
import OverviewKpiStrip from "./overview-kpi-strip";
import SegmentLandscapeChart from "./segment-landscape-chart";

interface DemographicsOverviewProps {
  data?: DirectorDemographicsOverviewData;
  meta?: DirectorDemographicsOverviewMeta;
  filters: DirectorDemographicsOverviewParams;
  filterOptions?: DemographicsFilterOptions;
  onApplyFilters: (filters: DirectorDemographicsOverviewParams) => void;
  onPageChange: (page: number) => void;
  isSegmentsLoading?: boolean;
  onOpenSegment: (segmentId: string) => void;
}

export default function DemographicsOverview({
  data,
  meta,
  filters,
  filterOptions,
  onApplyFilters,
  onPageChange,
  isSegmentsLoading = false,
  onOpenSegment,
}: DemographicsOverviewProps) {
  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden px-2 py-4 pb-8 lg:px-6">
      <OverviewHeader
        meta={meta}
        filterControl={
          <DemographicsFilterPopover
            filters={filters}
            options={filterOptions}
            onApply={onApplyFilters}
          />
        }
      />
      <div className="min-w-0 max-w-full space-y-5">
        <OverviewKpiStrip kpis={data?.kpis} />
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <AudienceCompositionChart audience={data?.audienceComposition} />
          <DataCoverageCard metrics={data?.dataCoverage} />
        </div>
        <AcquisitionMapWorkspace data={data?.acquisitionMap} />
        <SegmentLandscapeChart
          segments={data?.segments}
          pagination={meta}
          isLoading={isSegmentsLoading}
          onPageChange={onPageChange}
          onOpenSegment={onOpenSegment}
        />
      </div>
    </div>
  );
}
