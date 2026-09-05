"use client";

import { useCtvSaleOverviewQuery } from "@/hooks/use-ctv-sale-overview-query";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

import GreetingCard from "./greeting-card";
import PriorityTasks from "./priority-tasks";
import ContactResults from "../contact-results";
import ContactTrendChart from "../contact-trend-chart";
import StatCards from "./stat-cards";
import StudentStatusChart from "../student-status-chart";
import TaskSummary from "./task-summary";

export default function CtvSaleDashboard() {
  const query = useCtvSaleOverviewQuery({
    trendRange: "7d",
    outcomeRange: "30d",
    priorityLimit: 3,
  });

  if (query.isLoading && !query.data) {
    return <OverviewSkeleton />;
  }

  if (query.isError && !query.data) {
    return (
      <main id="main-content" className="min-w-0 px-2 py-4 pb-8 lg:px-6">
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Không thể tải tổng quan CTV Sale
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {query.error?.message ?? "Vui lòng thử lại sau."}
            </p>
          </div>
          <Button
            variant="primary"
            appearance="outline"
            onPress={() => query.refetch()}
          >
            Thử lại
          </Button>
        </Card>
      </main>
    );
  }

  if (!query.data) return null;
  const overview = query.data;

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6"
    >
      {overview.meta.warnings.length > 0 ? (
        <div
          className="rounded-xl border border-badge-warning-background bg-badge-warning-background/40 px-4 py-3 text-xs text-warning-700"
          role="status"
        >
          Dữ liệu tổng quan đang ở trạng thái{" "}
          {overview.meta.status === "unavailable"
            ? "chưa sẵn sàng"
            : "một phần"}
          : {overview.meta.warnings.join(", ")}.
        </div>
      ) : null}
      <GreetingCard
        meta={overview.meta}
        priorityTaskCount={overview.tasks.priority.items.length}
      />
      <StatCards stats={overview.kpis} />

      <section
        aria-label="Việc cần xử lý và tiến độ công việc"
        className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.75fr)]"
      >
        <PriorityTasks
          tasks={overview.tasks.priority.items}
          overdueCount={overview.tasks.priority.overdueCount}
          timezone={overview.meta.timezone}
          onTaskCompleted={() => {
            void query.refetch();
          }}
        />
        <TaskSummary summary={overview.tasks.summary} />
      </section>

      <section
        aria-label="Phân tích hoạt động liên hệ"
        className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <StudentStatusChart data={overview.studentStatus} />
        <ContactTrendChart data={overview.contacts.trend} />
      </section>

      <ContactResults data={overview.contacts.outcomes} />
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:space-y-6 lg:px-6"
      aria-busy="true"
    >
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.75fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </main>
  );
}
