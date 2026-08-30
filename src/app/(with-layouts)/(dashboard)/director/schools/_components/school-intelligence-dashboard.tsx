import SchoolActionPlan from "./ai-school-insight";
import ActivityTimeline from "./activity-timeline";
import SchoolConversionFunnel from "./school-conversion-funnel";
import PerformanceChart from "./performance-chart";
import SchoolHeader from "./school-header";
import SchoolHealthOverview from "./school-health-overview";
import SchoolPotentialBreakdown from "./school-potential-breakdown";
import SchoolKpiStrip from "./school-kpi-strip";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolIntelligenceDashboardProps {
  data: SchoolIntelligenceData;
}

export default function SchoolIntelligenceDashboard({
  data,
}: SchoolIntelligenceDashboardProps) {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <SchoolHeader data={data} />
      <SchoolKpiStrip data={data} />

      <section className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.84fr)]">
        <SchoolPotentialBreakdown data={data} />
        <SchoolActionPlan data={data} />
      </section>

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.84fr)]">
        <PerformanceChart data={data} />
        <SchoolHealthOverview data={data} />
      </section>

      <section className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
        <SchoolConversionFunnel data={data} />
        <ActivityTimeline data={data} />
      </section>
    </main>
  );
}
