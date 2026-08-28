"use client";

import AdmissionsFunnel from "./admissions-funnel";
import AdmissionsTrend from "./admissions-trend";
import CampusPerformanceChart from "./campus-performance-chart";
import ConversionHealth from "./conversion-health";
import DirectorBriefing from "./director-briefing";
import EnrollmentForecast from "./enrollment-forecast";
import DirectorKpiCards from "./kpi-cards";
import MarketOverview from "./market-overview";
import DirectorPageHeader from "./page-header";
import SourceMixChart from "./source-mix-chart";
import WeeklyActivityChart from "./weekly-activity-chart";

export default function DirectorDashboard() {
  return (
    <div className="mt-4 min-w-0 space-y-6 overflow-hidden pb-8">
      <DirectorPageHeader />

      <div className="space-y-6 px-2 lg:px-5">
        <DirectorKpiCards />

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
          <EnrollmentForecast />
          <DirectorBriefing />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <AdmissionsFunnel />
          <ConversionHealth />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <AdmissionsTrend />
          <MarketOverview />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <CampusPerformanceChart />
          <SourceMixChart />
        </div>

        <WeeklyActivityChart />
      </div>
    </div>
  );
}
