import AiSchoolInsight from "./ai-school-insight";
import ActivityTimeline from "./activity-timeline";
import PerformanceChart from "./performance-chart";
import SchoolHeader from "./school-header";
import SchoolKpiStrip from "./school-kpi-strip";
import SchoolProfile from "./school-profile";
import StudentDemographics from "./student-demographics";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolIntelligenceDashboardProps {
  data: SchoolIntelligenceData;
}

export default function SchoolIntelligenceDashboard({ data }: SchoolIntelligenceDashboardProps) {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <SchoolHeader data={data} />
      <SchoolKpiStrip data={data} />

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <PerformanceChart data={data} />
        <AiSchoolInsight data={data} />
      </section>

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <div className="min-w-0 space-y-5">
          <StudentDemographics data={data} />
          <SchoolProfile data={data} />
        </div>
        <ActivityTimeline data={data} />
      </section>
    </main>
  );
}
