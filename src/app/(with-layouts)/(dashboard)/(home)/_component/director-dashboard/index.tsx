"use client";

import { Button } from "@/components/tailgrids/core/button";
import { useDirectorOverviewQuery } from "@/hooks/use-director-overview-queries";
import AdmissionsFunnel from "./admissions-funnel";
import AdmissionsTrend from "./admissions-trend";
import DirectorBriefing from "./director-briefing";
import EnrollmentForecast from "./enrollment-forecast";
import DirectorKpiCards from "./kpi-cards";
import MarketOverview from "./market-overview";
import DirectorPageHeader from "./page-header";
import SourceMixChart from "./source-mix-chart";
import WeeklyActivityChart from "./weekly-activity-chart";

export default function DirectorDashboard() {
  const { data, isLoading, isError, refetch } = useDirectorOverviewQuery({
    admissionYear: 2026,
    scope: "all",
    trendRange: "30d",
  });

  if (isLoading && !data) {
    return (
      <div className="mt-4 min-w-0 space-y-6 overflow-hidden pb-8">
        <div className="mx-2 lg:mx-6 h-28 animate-pulse rounded-2xl border border-card-border bg-card-background" />
        <div className="space-y-6 px-2 lg:px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-2xl border border-card-border bg-card-background" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
            <div className="h-96 animate-pulse rounded-2xl border border-card-border bg-card-background" />
            <div className="h-96 animate-pulse rounded-2xl border border-card-border bg-card-background" />
          </div>
          <div className="h-[34rem] animate-pulse rounded-2xl border border-card-border bg-card-background" />
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="mt-4 min-w-0 space-y-6 p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-background p-12 text-center">
          <p className="text-base font-semibold text-text-primary">Không thể tải dữ liệu tổng quan tuyển sinh</p>
          <p className="mt-2 text-sm text-text-secondary">Đã xảy ra lỗi khi kết nối tới hệ thống. Vui lòng thử lại.</p>
          <Button className="mt-6" onPress={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 min-w-0 space-y-6 overflow-hidden pb-8">
      <DirectorPageHeader meta={data?.meta} />

      <div className="space-y-6 px-2 lg:px-5">
        <DirectorKpiCards kpis={data?.kpis} />

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
          <EnrollmentForecast forecast={data?.forecast} />
          <DirectorBriefing briefing={data?.briefing} />
        </div>

        <AdmissionsFunnel pipeline={data?.pipeline} admissionYear={data?.meta?.admissionYear} />

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <AdmissionsTrend admissionsTrend={data?.admissionsTrend} />
          <MarketOverview marketOverview={data?.marketOverview} />
        </div>

        <SourceMixChart sourcePerformance={data?.sourcePerformance} />

        <WeeklyActivityChart weeklyActivity={data?.weeklyActivity} />
      </div>
    </div>
  );
}
