"use client";

import GreetingCard from "./greeting-card";
import PriorityTasks from "./priority-tasks";
import ContactResults from "../contact-results";
import ContactTrendChart from "../contact-trend-chart";
import StatCards from "./stat-cards";
import StudentStatusChart from "../student-status-chart";
import TaskSummary from "./task-summary";
import { dashboardStats } from "./data";

export default function CtvSaleDashboard() {
  return (
    <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6">
      <GreetingCard />
      <StatCards stats={dashboardStats} />

      <section aria-label="Việc cần xử lý và tiến độ công việc" className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.75fr)]">
        <PriorityTasks />
        <TaskSummary />
      </section>

      <section aria-label="Phân tích hoạt động liên hệ" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <StudentStatusChart />
        <ContactTrendChart />
      </section>

      <ContactResults />
    </main>
  );
}
