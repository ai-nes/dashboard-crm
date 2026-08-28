import LeadGrowthChart from "./_component/lead-growth-chart";
import LeadsReport from "./_component/leads-report";
import CrmPageHeader from "./_component/page-header";
import RecentActivities from "./_component/recent-activities";
import UpcomingTasks from "./_component/upcoming-tasks";

export default function Crm() {
  return (
    <div className="mt-6 space-y-5">
      {/* Header Section */}
      <div className="px-2 lg:px-6">
        <CrmPageHeader />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <LeadGrowthChart />
        <LeadsReport />
        <UpcomingTasks />
        <RecentActivities />
      </div>
    </div>
  );
}
