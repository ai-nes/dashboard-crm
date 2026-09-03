"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  useDirectorDemographicsOverviewQuery,
  useDirectorDemographicsSegmentQuery,
} from "@/hooks/use-demographics-queries";
import { demographicSegments } from "@/services/api/demographics/data";
import type { DirectorDemographicsOverviewParams } from "@/services/api/demographics/types";
import DemographicsOverview from "./demographics-overview";
import SegmentDetailDashboard from "./segment-detail-dashboard";

export default function DemographicExplorerDashboard() {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [overviewParams, setOverviewParams] = useState<DirectorDemographicsOverviewParams>({
    admissionYear: 2026,
    period: "season",
    scope: "all",
    page: 1,
    pageSize: 5,
  });

  const {
    data: overviewResponse,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    isPlaceholderData: isOverviewPlaceholder,
    refetch: refetchOverview,
  } = useDirectorDemographicsOverviewQuery(overviewParams, {
    placeholderData: keepPreviousData,
  });

  const {
    data: segmentResponse,
    isLoading: isSegmentLoading,
  } = useDirectorDemographicsSegmentQuery(
    {
      segment_id: selectedSegmentId ?? "",
      admissionYear: overviewParams.admissionYear ?? 2026,
    },
    {
      enabled: Boolean(selectedSegmentId),
    },
  );

  const allSegments = overviewResponse?.data?.segments ?? demographicSegments;
  const selectedSegment =
    allSegments.find((segment) => segment.id === selectedSegmentId) ??
    demographicSegments.find((segment) => segment.id === selectedSegmentId) ??
    null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    let scrollParent = document.getElementById("main-content")?.parentElement ?? null;

    while (scrollParent) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        scrollParent.scrollTo({ top: 0, behavior: "auto" });
        break;
      }
      scrollParent = scrollParent.parentElement;
    }
  }, [selectedSegmentId]);

  const openSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
  };

  const applyOverviewFilters = (nextFilters: DirectorDemographicsOverviewParams) => {
    setSelectedSegmentId(null);
    setOverviewParams({
      ...nextFilters,
      admissionYear: nextFilters.admissionYear ?? overviewParams.admissionYear ?? 2026,
      period: nextFilters.period ?? "season",
      scope: nextFilters.scope ?? "all",
      page: 1,
      pageSize: overviewParams.pageSize ?? 5,
    });
  };

  const handleSegmentPageChange = (page: number) => {
    setOverviewParams((current) => ({ ...current, page }));
  };

  if (isOverviewLoading && !overviewResponse) {
    return (
      <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-28 rounded-2xl bg-card-background border border-card-border" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-32 rounded-2xl bg-card-background border border-card-border" />
            <div className="h-32 rounded-2xl bg-card-background border border-card-border" />
            <div className="h-32 rounded-2xl bg-card-background border border-card-border" />
            <div className="h-32 rounded-2xl bg-card-background border border-card-border" />
          </div>
          <div className="h-96 rounded-2xl bg-card-background border border-card-border" />
        </div>
      </main>
    );
  }

  if (isOverviewError && !overviewResponse) {
    return (
      <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-background p-12 text-center">
          <p className="text-base font-semibold text-text-primary">Không thể tải dữ liệu phân tích học sinh</p>
          <p className="mt-2 text-sm text-text-secondary">Đã xảy ra lỗi khi kết nối tới hệ thống. Vui lòng thử lại.</p>
          <Button className="mt-6" onPress={() => refetchOverview()}>
            Thử lại
          </Button>
        </div>
      </main>
    );
  }

  if (!selectedSegment) {
    return (
      <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden">
        <DemographicsOverview
          data={overviewResponse?.data}
          meta={overviewResponse?.meta}
          filters={overviewParams}
          filterOptions={overviewResponse?.data?.filterOptions}
          onApplyFilters={applyOverviewFilters}
          onPageChange={handleSegmentPageChange}
          isSegmentsLoading={isOverviewPlaceholder}
          onOpenSegment={openSegment}
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden">
      {isSegmentLoading && !segmentResponse ? (
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-24 rounded-2xl bg-card-background border border-card-border" />
            <div className="h-64 rounded-2xl bg-card-background border border-card-border" />
          </div>
        </div>
      ) : (
        <SegmentDetailDashboard
          segment={segmentResponse?.data?.segment ?? selectedSegment}
          detailData={segmentResponse?.data}
          onBack={() => setSelectedSegmentId(null)}
        />
      )}
    </main>
  );
}
