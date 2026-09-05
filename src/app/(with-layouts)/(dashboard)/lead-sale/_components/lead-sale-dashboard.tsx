"use client";

import { useLeadSaleOverviewQuery } from "@/hooks/use-lead-sale-overview-query";

import InterventionPanel from "./intervention-panel";
import LeadSaleHeader from "./lead-sale-header";
import ResultTrendChart from "./result-trend-chart";
import StatCards from "./stat-cards";
import StudentStatusChart from "./student-status-chart";
import TeamPerformance from "./team-performance";
import {
  toInterventionItems,
  toLeadSaleStats,
  toResultTrendData,
  toStudentStatusData,
  toTeamPerformance,
} from "./data";

export default function LeadSaleDashboard() {
  const overview = useLeadSaleOverviewQuery({ trendRange: "4w" });

  if (overview.isPending) {
    return <DashboardState message="Đang tải tổng quan đội ngũ Sale…" />;
  }

  if (overview.isError) {
    return (
      <DashboardState
        message={
          overview.error.message || "Không thể tải tổng quan Lead Sales."
        }
        action={overview.refetch}
      />
    );
  }

  const data = overview.data;
  const stats = toLeadSaleStats(data.kpis);
  const interventions = toInterventionItems(data.interventions.items);
  const members = toTeamPerformance(data.teamPerformance.items);
  const statusItems = toStudentStatusData(data.studentStatus.items);
  const trendRanges = {
    "4w": toResultTrendData(data.resultTrend.ranges["4w"].points),
    "3m": toResultTrendData(data.resultTrend.ranges["3m"].points),
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6"
    >
      <LeadSaleHeader meta={data.meta} />
      <StatCards stats={stats} />

      <section aria-label="Các nhóm cần can thiệp" className="min-w-0">
        <InterventionPanel items={interventions} />
      </section>

      <section
        aria-label="Hiệu suất và trạng thái đội ngũ"
        className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]"
      >
        <TeamPerformance items={members} />
        <StudentStatusChart
          items={statusItems}
          total={data.studentStatus.total}
        />
      </section>

      <section aria-label="Xu hướng kết quả của đội ngũ" className="min-w-0">
        <ResultTrendChart
          ranges={trendRanges}
          defaultRange={data.resultTrend.defaultRange}
        />
      </section>
    </main>
  );
}

function DashboardState({
  message,
  action,
}: {
  message: string;
  action?: () => void;
}) {
  return (
    <main id="main-content" className="px-2 py-8 lg:px-6" aria-live="polite">
      <div className="rounded-2xl border border-card-border bg-card-background p-6 text-sm text-text-secondary">
        <p>{message}</p>
        {action ? (
          <button
            type="button"
            onClick={() => void action()}
            className="mt-4 rounded-lg bg-button-primary-background px-3.5 py-2 text-sm font-semibold text-button-primary-text hover:bg-button-primary-hover-background"
          >
            Thử lại
          </button>
        ) : null}
      </div>
    </main>
  );
}
