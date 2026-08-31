import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import ActivityTimeline from "./activity-timeline";
import SchoolAcademicProfile from "./school-academic-profile";
import SchoolActionPlan from "./school-action-plan";
import SchoolHeader from "./school-header";
import SchoolLocalityCard from "./school-locality-card";
import SchoolOutcomes from "./school-outcomes";
import SchoolPotentialBreakdown from "./school-potential-breakdown";
import SchoolPotentialDecomposition from "./school-potential-decomposition";
import SchoolExamScoreDistribution from "./school-exam-score-distribution";
import SchoolRelationshipCard from "./school-relationship-card";

interface SchoolIntelligenceDashboardProps {
  data: SchoolIntelligenceData;
}

/**
 * School 360 detail entry point.
 *
 * The order is intentionally kept aligned with docs/school360: context and
 * priority first, locality next, then outcomes, academic profile, relationship
 * and activity follow-up.
 */
export default function SchoolIntelligenceDashboard({ data }: SchoolIntelligenceDashboardProps) {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <SchoolHeader data={data} />

      <section className="grid min-w-0 gap-5 xl:grid-cols-[1.16fr_0.84fr]" aria-label="Ưu tiên và kế hoạch tiếp cận">
        <SchoolPotentialBreakdown data={data} />
        <SchoolActionPlan data={data} />
      </section>

      <SchoolLocalityCard
        demographics={data.demographics}
        geography={data.geography}
        school={data.school}
      />

      <SchoolOutcomes data={data} />
      <SchoolAcademicProfile data={data} />
      <SchoolRelationshipCard data={data} />
      <ActivityTimeline data={data} />
      <section className="grid min-w-0 gap-5 xl:grid-cols-[1.1fr_0.9fr]" aria-label="Phân tích điểm trường">
        <SchoolPotentialDecomposition data={data} />
        <SchoolExamScoreDistribution data={data} />
      </section>
    </main>
  );
}
