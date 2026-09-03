"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useDirectorAdmissionFunnelQuery } from "@/hooks/use-director-admission-funnel-queries";

import AdmissionFunnelHeader from "./admission-funnel-header";
import FunnelAgingTable from "./funnel-aging-table";
import FunnelCohortChart from "./funnel-cohort-chart";
import FunnelDropAnalysis from "./funnel-drop-analysis";
import FunnelPriorityActions from "./funnel-priority-actions";
import FunnelSourceChart from "./funnel-source-chart";
import FunnelStageChart from "./funnel-stage-chart";
import FunnelSummary from "./funnel-summary";
import { AdmissionFunnelDataProvider } from "./admission-funnel-context";

export default function AdmissionFunnelDashboard() {
  const { data, isLoading, isError, error, refetch } = useDirectorAdmissionFunnelQuery({
    admissionYear: 2026,
    scope: "all",
  });

  if (!data) {
    if (isLoading) {
      return (
        <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
          <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />
        </main>
      );
    }

    return (
      <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-base font-semibold text-text-primary">Không thể tải dữ liệu phễu tuyển sinh</p>
          <p className="mt-2 text-sm text-text-secondary">
            {isError ? error?.message : "Dữ liệu từ hệ thống chưa sẵn sàng. Vui lòng thử lại."}
          </p>
          <Button className="mt-6" onPress={() => refetch()}>
            Thử lại
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <AdmissionFunnelDataProvider data={data}>
      <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
        <AdmissionFunnelHeader />
        <FunnelSummary />
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]">
          <FunnelStageChart />
          <FunnelPriorityActions />
        </div>
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:items-stretch xl:grid-cols-2">
          <FunnelDropAnalysis />
          <FunnelAgingTable />
        </div>
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:items-stretch xl:grid-cols-2">
          <FunnelSourceChart />
          <FunnelCohortChart />
        </div>
      </main>
    </AdmissionFunnelDataProvider>
  );
}
