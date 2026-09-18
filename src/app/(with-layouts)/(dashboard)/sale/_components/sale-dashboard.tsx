"use client";

import { useState } from "react";

import { useSaleOverviewQuery } from "@/hooks/use-sale-overview-query";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

import ConversionTrendChart from "./conversion-trend-chart";
import SaleDetailSheet from "./sale-detail-sheet";
import type { SaleDashboardDetail } from "./sale-dashboard-detail.types";
import PipelineHealth from "./pipeline-health";
import PriorityTasks from "./priority-tasks";
import RecentRecords from "./recent-records";
import SalePageHeader from "./sale-page-header";
import StudentStageChart from "./student-stage-chart";

export default function SaleDashboard() {
  const [activeDetail, setActiveDetail] = useState<SaleDashboardDetail | null>(
    null,
  );
  const query = useSaleOverviewQuery({
    trendRange: "4w",
    priorityLimit: 10,
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
              Không thể tải tổng quan Sale
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
      <SalePageHeader meta={overview.meta} />

      <section aria-label="Việc cần làm hôm nay" className="min-w-0">
        <PriorityTasks
          tasks={overview.tasks.priority.items}
          onOpenTask={(task) => setActiveDetail({ kind: "task", task })}
          dueTodayCount={overview.tasks.summary.today.pending}
          overdueCount={overview.tasks.priority.overdueCount}
          timezone={overview.meta.timezone}
          referenceDate={overview.meta.date}
        />
      </section>

      <RecentRecords
        leads={overview.recentLeads}
        students={overview.recentStudents}
        timezone={overview.meta.timezone}
        onOpenLead={(lead) => setActiveDetail({ kind: "lead", lead })}
        onOpenStudent={(record) => setActiveDetail({ kind: "student", record })}
      />

      <section
        aria-label="Xu hướng và trạng thái học sinh"
        className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2"
      >
        <ConversionTrendChart data={overview.conversionTrend} />
        <StudentStageChart data={overview.studentStages} />
      </section>

      {overview.health ? <PipelineHealth data={overview.health} /> : null}

      <SaleDetailSheet
        detail={activeDetail}
        isOpen={activeDetail !== null}
        timezone={overview.meta.timezone}
        referenceDate={overview.meta.date}
        onOpenChange={(open) => {
          if (!open) setActiveDetail(null);
        }}
      />
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
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </main>
  );
}
