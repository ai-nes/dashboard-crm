import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import ActivityTimeline from "./activity-timeline";
import SchoolAcademicProfile from "./school-academic-profile";
import SchoolActionPlan from "./school-action-plan";
import SchoolHeader from "./school-header";
import SchoolOutcomes from "./school-outcomes";
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
 * priority first, then outcomes, academic profile, relationship and activity
 * follow-up. Locality is summarized in the overview map.
 */
export default function SchoolIntelligenceDashboard({
  data,
}: SchoolIntelligenceDashboardProps) {
  return (
    <main className="min-w-0 px-2 py-4 pb-8 lg:px-6">
      <SchoolHeader data={data} />
      <DetailTabs
        ariaLabel="Các phần trong hồ sơ trường học"
        className="mt-4"
        defaultSelectedKey="overview"
        tabs={getSchoolTabs(data)}
      />
    </main>
  );
}

function getSchoolTabs(data: SchoolIntelligenceData): DetailTabItem[] {
  return [
    {
      id: "overview",
      label: "Hành động tiếp theo",
      content: (
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <SchoolPotentialDecomposition data={data} />
          <SchoolActionPlan data={data} />
        </div>
      ),
    },
    {
      id: "outcomes",
      label: "Kết quả tuyển sinh",
      content: <SchoolOutcomes data={data} />,
    },
    {
      id: "academic",
      label: "Khối ngành & Điểm thi THPT",
      content: (
        <div className="space-y-5">
          <SchoolAcademicProfile data={data} />
          <SchoolExamScoreDistribution data={data} />
        </div>
      ),
    },
    {
      id: "relationship",
      label: "Quan hệ & hoạt động",
      content: (
        <div className="space-y-5">
          <SchoolRelationshipCard data={data} />
          <ActivityTimeline data={data} />
        </div>
      ),
    },
  ];
}
