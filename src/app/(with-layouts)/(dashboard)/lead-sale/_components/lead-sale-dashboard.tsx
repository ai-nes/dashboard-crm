"use client";

import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

import ActionQueue from "./action-queue";
import DashboardHeader from "./dashboard-header";
import LeadSaleDetailSheet from "./lead-sale-detail-sheet";
import { useLeadSaleOverviewQuery } from "@/hooks/use-lead-sale-overview-query";
import PipelineAgingChart from "./pipeline-aging-chart";
import PerformanceTrend from "./performance-trend";
import PriorityQueue from "./priority-queue";
import RepPerformance from "./rep-performance";
import type { LeadSaleDetailId } from "./lead-sale-dashboard.types";
import StageAnalysis from "./stage-analysis";
import { toLeadSaleDashboardData } from "./lead-sale-dashboard-adapter";

export default function LeadSaleDashboard() {
  const [selectedDetailId, setSelectedDetailId] = useState<LeadSaleDetailId | null>(null);
  const query = useLeadSaleOverviewQuery({ trendRange: "4w", teamMemberLimit: 50 });
  if (query.isPending) {
    return <OverviewSkeleton />;
  }
  if (query.isError) {
    return <DashboardState message={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (!query.data) {
    return <DashboardState message="Chưa có dữ liệu tổng quan tuyển sinh." />;
  }

  const data = toLeadSaleDashboardData(query.data);
  const selectedDetail = selectedDetailId ? data.details[selectedDetailId] : null;

  return (
    <main id="main-content" className="min-w-0 space-y-6 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
      <DashboardHeader data={data} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
        <section aria-label="Công việc ưu tiên" className="min-w-0">
          <ActionQueue items={data.actions} onOpenDetail={setSelectedDetailId} />
        </section>

        <section aria-label="Hồ sơ ưu tiên" className="min-w-0">
          <PriorityQueue records={data.priorityQueue} onOpenDetail={setSelectedDetailId} />
        </section>
      </div>

      <section aria-label="Thời gian ở giai đoạn hiện tại" className="min-w-0">
        <PipelineAgingChart
          buckets={data.agingBuckets}
          actionRequiredCount={data.summary.actionRequired}
          onOpenDetail={setSelectedDetailId}
        />
      </section>

      <section aria-label="Tổng quan phễu tuyển sinh" className="min-w-0">
        <StageAnalysis stages={data.stages} onOpenDetail={setSelectedDetailId} />
      </section>

      <section aria-label="Hiệu suất nhân viên tư vấn" className="min-w-0">
        <RepPerformance reps={data.reps} onOpenDetail={setSelectedDetailId} />
      </section>

      <section aria-label="Xu hướng nhập học" className="min-w-0">
        <PerformanceTrend data={data.trend} />
      </section>

      <LeadSaleDetailSheet
        detail={selectedDetail}
        isOpen={Boolean(selectedDetailId)}
        onOpenDetail={setSelectedDetailId}
        onOpenChange={(open) => {
          if (!open) setSelectedDetailId(null);
        }}
      />
    </main>
  );
}

function DashboardState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main id="main-content" className="min-w-0 space-y-6 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
      <section className="rounded-2xl border border-card-border bg-card-background p-6 shadow-xs" role="status">
        <p className="text-sm font-semibold text-text-primary">Tổng quan tuyển sinh</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>
        {onRetry ? (
          <Button type="button" size="sm" className="mt-4" onPress={onRetry}>
            Thử lại
          </Button>
        ) : null}
      </section>
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <main
      id="main-content"
      className="min-w-0 space-y-6 overflow-x-hidden px-2 py-4 pb-8 lg:px-6"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Đang tải dữ liệu tổng quan tuyển sinh...
      </span>

      <section
        aria-hidden="true"
        className="flex flex-col gap-5 border-b border-card-border pb-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0 w-full">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="mt-3 h-8 w-64 rounded-md" />
          <Skeleton className="mt-2 h-4 w-full max-w-2xl rounded-md" />
          <Skeleton className="mt-2 h-3 w-48 rounded-md" />
        </div>
        <div className="flex shrink-0 gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </section>

      <div aria-hidden="true" className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>

      <Skeleton aria-hidden="true" className="h-64 rounded-2xl" />
      <Skeleton aria-hidden="true" className="h-96 rounded-2xl" />
      <Skeleton aria-hidden="true" className="h-96 rounded-2xl" />
      <Skeleton aria-hidden="true" className="h-80 rounded-2xl" />
    </main>
  );
}
