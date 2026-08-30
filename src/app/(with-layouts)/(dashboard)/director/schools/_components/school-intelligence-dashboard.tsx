import AiSchoolInsight from "./ai-school-insight";
import ActivityTimeline from "./activity-timeline";
import SchoolConversionFunnel from "./school-conversion-funnel";
import PerformanceChart from "./performance-chart";
import SchoolHeader from "./school-header";
import SchoolHealthOverview from "./school-health-overview";
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
      <SchoolHealthOverview data={data} />

      <section className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.78fr)]">
        <PerformanceChart data={data} />
        <ActivityTimeline data={data} />
      </section>

      <section className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
        <SchoolConversionFunnel data={data} />
        <AiSchoolInsight data={data} />
      </section>

      <SchoolStudentSignals data={data} />

      <StudentDemographics data={data} />
    </main>
  );
}
