"use client";

import { useMemo, useState } from "react";

import { provinces } from "./data";
import CapabilitySummary from "./capability-summary";
import EnrollmentTrend from "./enrollment-trend";
import FunnelAnalysis from "./funnel-analysis";
import OverviewCharts from "./overview-charts";
import PriorityActions from "./priority-actions";
import RegionalPerformanceHeader from "./regional-performance-header";
import ProvinceSummary from "./province-summary";
import RegionalPerformanceControls from "./regional-performance-controls";

export default function RegionalPerformanceDashboard() {
  const [selectedId, setSelectedId] = useState("dak-lak");
  const selectedProvince = useMemo(
    () =>
      provinces.find((province) => province.id === selectedId) ?? provinces[0],
    [selectedId],
  );
  if (!selectedProvince) return null;

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 overflow-hidden px-2 py-4 pb-8 lg:px-6"
    >
      <RegionalPerformanceHeader>
        <RegionalPerformanceControls
          provinces={provinces}
          selectedProvinceId={selectedId}
          onProvinceChange={setSelectedId}
          compact
        />
      </RegionalPerformanceHeader>
      <section
        className="space-y-5"
        aria-label={`Tổng quan và chi tiết ${selectedProvince.name}`}
      >
        <OverviewCharts provinces={provinces} />
        <ProvinceSummary province={selectedProvince} />
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
          <EnrollmentTrend province={selectedProvince} />
          <FunnelAnalysis province={selectedProvince} />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
          <CapabilitySummary province={selectedProvince} />
          <PriorityActions province={selectedProvince} />
        </div>
      </section>
    </main>
  );
}
