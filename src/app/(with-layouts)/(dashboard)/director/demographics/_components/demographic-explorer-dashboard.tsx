"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import DemographicsOverview from "./demographics-overview";
import SegmentDetailDashboard from "./segment-detail-dashboard";
import { demographicSegments, initialFilters } from "./data";
import type { SegmentFilter } from "./types";

export default function DemographicExplorerDashboard() {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SegmentFilter[]>(initialFilters);
  const selectedSegment = demographicSegments.find((segment) => segment.id === selectedSegmentId) ?? null;

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
    const segment = demographicSegments.find((item) => item.id === segmentId);
    if (!segment) return;
    setFilters(segment.filters);
    setSelectedSegmentId(segment.id);
  };

  const addFilter = (filter: SegmentFilter) => {
    if (filters.some((current) => current.id === filter.id)) {
      toast.message(`Điều kiện ${filter.label.toLowerCase()} đã có trong phân khúc.`);
      return;
    }
    setFilters((current) => [...current, filter]);
  };

  if (!selectedSegment) {
    return <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden"><DemographicsOverview onOpenSegment={openSegment} /></main>;
  }

  return (
    <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden">
      <SegmentDetailDashboard
        filters={filters}
        segment={selectedSegment}
        onAddFilter={addFilter}
        onBack={() => setSelectedSegmentId(null)}
        onRemoveFilter={(id) => setFilters((current) => current.filter((filter) => filter.id !== id))}
        onResetFilters={() => setFilters([])}
      />
    </main>
  );
}
