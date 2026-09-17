"use client";

import { useSaleOverviewQuery } from "@/hooks/use-sale-overview-query";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

import AttentionStudents from "./attention-students";
import ConversionTrendChart from "./conversion-trend-chart";
import FunnelOverview from "./funnel-overview";
import GreetingCard from "./greeting-card";
import PerformanceSummary from "./performance-summary";
import PipelineHealth from "./pipeline-health";
import PriorityTasks from "./priority-tasks";
import StudentStatusChart from "./student-status-chart";

export default function SaleDashboard() {
  const query = useSaleOverviewQuery({
    trendRange: "4w",
    priorityLimit: 4,
  });

  if (query.isLoading && !query.data) {
    return <OverviewSkeleton />;
  }

  if (query.isError && !query.data) {
    return (
      <main id="main-content" className="min-w-0 px-2 py-4 pb-8 lg:px-6">
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Không thể tải tổng quan Sale</h1>
            <p className="mt-2 text-sm text-text-secondary">
              {query.error?.message ?? "Vui lòng thử lại sau."}
            </p>
          </div>
          <Button variant="primary" appearance="outline" onPress={() => query.refetch()}>
            Thử lại
          </Button>
        </Card>
      </main>
    );
  }

  if (!query.data) return null;
  const overview = query.data;

  return (
    <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6">
      {overview.meta.warnings.length > 0 ? (
        <div
          className="rounded-xl border border-badge-warning-background bg-badge-warning-background/40 px-4 py-3 text-xs text-warning-700"
          role="status"
        >
          Dữ liệu tổng quan đang ở trạng thái {overview.meta.status === "unavailable" ? "chưa sẵn sàng" : "một phần"}: {overview.meta.warnings.join(", ")}.
        </div>
      ) : null}
      <GreetingCard
        meta={overview.meta}
        pendingTaskCount={overview.tasks.summary.today.pending}
        overdueTaskCount={overview.tasks.summary.overdue.count}
      />

      {overview.performance ? <PerformanceSummary data={overview.performance} /> : null}

      <section aria-label="Công việc ưu tiên và học sinh cần chú ý" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <PriorityTasks
          tasks={overview.tasks.priority.items}
          overdueCount={overview.tasks.priority.overdueCount}
          timezone={overview.meta.timezone}
        />
        <AttentionStudents items={overview.attention.items} />
      </section>

      <section aria-label="Phễu tuyển sinh cá nhân" className="min-w-0">
        <FunnelOverview stages={overview.pipeline.stages} />
      </section>

      {overview.health ? (
        <section aria-label="Sức khỏe pipeline" className="min-w-0">
          <PipelineHealth data={overview.health} />
        </section>
      ) : null}

      <section aria-label="Xu hướng kết quả và phân bổ hồ sơ" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <ConversionTrendChart data={overview.conversionTrend} />
        <StudentStatusChart data={overview.studentStatus} />
      </section>
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </main>
  );
}
