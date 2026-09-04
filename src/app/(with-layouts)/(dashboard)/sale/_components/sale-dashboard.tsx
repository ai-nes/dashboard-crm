import GreetingCard from "./greeting-card";
import AttentionStudents from "./attention-students";
import ConversionTrendChart from "./conversion-trend-chart";
import FunnelOverview from "./funnel-overview";
import OperationsSummary from "./operations-summary";
import PriorityTasks from "./priority-tasks";
import StatCards from "./stat-cards";
import StudentStatusChart from "./student-status-chart";
import { saleStats } from "./data";

export default function SaleDashboard() {
  return (
    <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6">
      <GreetingCard />
      <StatCards stats={saleStats} />

      <section aria-label="Các task ưu tiên hôm nay" className="min-w-0">
        <PriorityTasks />
      </section>

      <section aria-label="Tổng quan luồng tuyển sinh và học sinh cần chú ý" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <FunnelOverview />
        <AttentionStudents />
      </section>

      <section aria-label="Phân tích chuyển đổi và trạng thái học sinh" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <ConversionTrendChart />
        <StudentStatusChart />
      </section>

      <OperationsSummary />
    </main>
  );
}
