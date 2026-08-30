"use client";

import { useEffect, useState } from "react";

import DemographicsOverview from "./demographics-overview";
import SegmentDetailDashboard from "./segment-detail-dashboard";
import { demographicSegments } from "./data";

export default function DemographicExplorerDashboard() {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
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
    setSelectedSegmentId(segment.id);
  };

  if (!selectedSegment) {
    return <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden"><DemographicsOverview onOpenSegment={openSegment} /></main>;
  }

  return (
    <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden">
      <SegmentDetailDashboard
        segment={selectedSegment}
        onBack={() => setSelectedSegmentId(null)}
      />
    </main>
  );
}
