import ActivityKpiStrip from "./activity-kpi-strip";
import ActivityCostChart from "./activity-cost-chart";
import ActivityPerformanceChart from "./activity-performance-chart";
import FieldDataOverview from "./field-data-overview";
import SchoolFieldActivityHeader from "./school-field-activity-header";
import UpcomingActivityPlan from "./upcoming-activity-plan";
import type { DirectorSchoolFieldActivityData } from "@/services/api/director-school-field-activity";

interface SchoolFieldActivityDashboardProps {
  data: DirectorSchoolFieldActivityData;
}

export default function SchoolFieldActivityDashboard({ data }: SchoolFieldActivityDashboardProps) {
  return (
    <main className="min-w-0 space-y-5 overflow-hidden px-2 py-4 pb-8 lg:px-6" id="main-content">
      <SchoolFieldActivityHeader meta={data.meta} />
      <ActivityKpiStrip kpis={data.kpis} />

      <section className="grid min-w-0 gap-5 xl:grid-cols-2" aria-label="Kết quả và kế hoạch hoạt động">
        <ActivityPerformanceChart activities={data.completedActivities} />
        <UpcomingActivityPlan activities={data.upcomingActivities} />
      </section>

      <ActivityCostChart activities={data.completedActivities} />

      <FieldDataOverview dataQuality={data.dataQuality} deviceSync={data.deviceSync} />
    </main>
  );
}
