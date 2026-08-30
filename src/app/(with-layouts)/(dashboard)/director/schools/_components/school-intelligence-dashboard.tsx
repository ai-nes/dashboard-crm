import ActivityTimeline from "./activity-timeline";
import SchoolAcademicProfile from "./school-academic-profile";
import SchoolActionPlan from "./school-action-plan";
import SchoolHeader from "./school-header";
import SchoolLocalityCard from "./school-locality-card";
import SchoolOutcomes from "./school-outcomes";
import SchoolPotentialBreakdown from "./school-potential-breakdown";
import SchoolRelationshipCard from "./school-relationship-card";

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

      <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.84fr)]">
        <SchoolPotentialBreakdown data={data} />
        <SchoolActionPlan data={data} />
      </section>

      <SchoolLocalityCard data={data} />

      <SchoolOutcomes data={data} />

      <SchoolAcademicProfile data={data} />

      <SchoolRelationshipCard data={data} />

      <ActivityTimeline data={data} />
    </main>
  );
}
