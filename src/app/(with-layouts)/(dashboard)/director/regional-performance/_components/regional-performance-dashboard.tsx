"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useDirectorRegionalPerformanceQuery } from "@/hooks/use-director-regional-performance-queries";
import CapabilitySummary from "./capability-summary";
import EnrollmentTrend from "./enrollment-trend";
import FunnelAnalysis from "./funnel-analysis";
import OverviewCharts from "./overview-charts";
import PriorityActions from "./priority-actions";
import RegionalPerformanceHeader from "./regional-performance-header";
import ProvinceSummary from "./province-summary";
import RegionalPerformanceControls from "./regional-performance-controls";

const EMPTY_PROVINCES: never[] = [];

export default function RegionalPerformanceDashboard() {
  const { data, isLoading, isError, error, refetch } =
    useDirectorRegionalPerformanceQuery({ admissionYear: 2026, scope: "all" });
  const provinces = data?.provinces ?? EMPTY_PROVINCES;
  const capabilityColumns = data?.capabilityColumns ?? [];
  const priorityActions = data?.priorityActions ?? [];
  const [selectedId, setSelectedId] = useState("");
  const selectedProvince = useMemo(
    () =>
      provinces.find((province) => province.id === selectedId) ?? provinces[0],
    [provinces, selectedId],
  );
  if (!selectedProvince) {
    return (
      <main
        id="main-content"
        className="min-w-0 space-y-5 overflow-hidden px-2 py-4 pb-8 lg:px-6"
      >
        {isLoading ? (
          <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-base font-semibold text-text-primary">
              Không thể tải dữ liệu hiệu suất theo địa bàn
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {isError
                ? error?.message
                : "Dữ liệu từ hệ thống chưa sẵn sàng. Vui lòng thử lại."}
            </p>
            <Button className="mt-6" onPress={() => refetch()}>
              Thử lại
            </Button>
          </Card>
        )}
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 overflow-hidden px-2 py-4 pb-8 lg:px-6"
    >
      <RegionalPerformanceHeader>
        <RegionalPerformanceControls
          provinces={provinces}
          selectedProvinceId={selectedProvince.id}
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
          <CapabilitySummary
            province={selectedProvince}
            capabilityColumns={capabilityColumns}
          />
          <PriorityActions
            province={selectedProvince}
            priorityActions={priorityActions}
          />
        </div>
      </section>
    </main>
  );
}
