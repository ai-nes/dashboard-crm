import InterventionPanel from "./intervention-panel";
import LeadSaleHeader from "./lead-sale-header";
import ResultTrendChart from "./result-trend-chart";
import StatCards from "./stat-cards";
import StudentStatusChart from "./student-status-chart";
import TeamPerformance from "./team-performance";
import { leadSaleStats } from "./data";

export default function LeadSaleDashboard() {
  return (
    <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6">
      <LeadSaleHeader />
      <StatCards stats={leadSaleStats} />

      <section aria-label="Các nhóm cần can thiệp" className="min-w-0">
        <InterventionPanel />
      </section>

      <section aria-label="Hiệu suất và trạng thái đội ngũ" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <TeamPerformance />
        <StudentStatusChart />
      </section>

      <section aria-label="Xu hướng kết quả của đội ngũ" className="min-w-0">
        <ResultTrendChart />
      </section>
    </main>
  );
}
