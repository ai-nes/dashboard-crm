"use client";

import AdmissionFunnelHeader from "./admission-funnel-header";
import FunnelAgingTable from "./funnel-aging-table";
import FunnelCohortChart from "./funnel-cohort-chart";
import FunnelDropAnalysis from "./funnel-drop-analysis";
import FunnelPriorityActions from "./funnel-priority-actions";
import FunnelSourceChart from "./funnel-source-chart";
import FunnelStageChart from "./funnel-stage-chart";
import FunnelSummary from "./funnel-summary";

export default function AdmissionFunnelDashboard() {
  return (
    <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
      <AdmissionFunnelHeader />
      <FunnelSummary />
      <FunnelStageChart />
      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <FunnelDropAnalysis />
        <FunnelAgingTable />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <FunnelSourceChart />
        <FunnelCohortChart />
      </div>
      <FunnelPriorityActions />
    </main>
  );
}
