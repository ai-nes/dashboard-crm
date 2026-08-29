import AiSchoolInsight from "./ai-school-insight";
import ActivityTimeline from "./activity-timeline";
import SchoolConversionFunnel from "./school-conversion-funnel";
import PerformanceChart from "./performance-chart";
import SchoolHeader from "./school-header";
import SchoolKpiStrip from "./school-kpi-strip";
import SchoolPotentialBreakdown from "./school-potential-breakdown";
import SchoolStudentSignals from "./school-student-signals";
import StudentDemographics from "./student-demographics";

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

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <PerformanceChart data={data} />
        <SchoolConversionFunnel data={data} />
      </section>

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <SchoolPotentialBreakdown data={data} />
        <AiSchoolInsight data={data} />
      </section>

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <StudentDemographics data={data} />
        <ActivityTimeline data={data} />
      </section>

      <SchoolStudentSignals data={data} />
    </main>
  );
}
