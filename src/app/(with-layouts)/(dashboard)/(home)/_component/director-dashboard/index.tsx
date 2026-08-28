"use client";

import AttentionQueue from "./attention-queue";
import AdmissionsFunnel from "./admissions-funnel";
import DecisionBrief from "./decision-brief";
import DirectorKpiCards from "./kpi-cards";
import DirectorPageHeader from "./page-header";
import SourcePerformance from "./source-performance";
import TeamPerformance from "./team-performance";

export default function DirectorDashboard() {
  return (
    <div className="mt-6 space-y-5">
      <DirectorPageHeader />

      <div className="space-y-5 px-2 lg:px-5">
        <DirectorKpiCards />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <AdmissionsFunnel />
          <AttentionQueue />
        </div>

        <DecisionBrief />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
          <TeamPerformance />
          <SourcePerformance />
        </div>
      </div>
    </div>
  );
}

