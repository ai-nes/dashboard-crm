"use client";

import { useState } from "react";

import ActionQueue from "./action-queue";
import DashboardHeader from "./dashboard-header";
import LeadSaleDetailSheet from "./lead-sale-detail-sheet";
import PipelineAgingChart from "./pipeline-aging-chart";
import PerformanceTrend from "./performance-trend";
import PriorityQueue from "./priority-queue";
import RepPerformance from "./rep-performance";
import {
  MOCK_LEAD_SALE_DASHBOARD,
  type LeadSaleDetailId,
} from "./mock-data";
import StageAnalysis from "./stage-analysis";
import SummaryCards from "./summary-cards";

export default function LeadSaleDashboard() {
  const [selectedDetailId, setSelectedDetailId] = useState<LeadSaleDetailId | null>(null);
  const data = MOCK_LEAD_SALE_DASHBOARD;
  const selectedDetail = selectedDetailId ? data.details[selectedDetailId] : null;

  return (
    <main id="main-content" className="min-w-0 space-y-6 overflow-x-hidden px-2 py-4 pb-8 lg:px-6">
      <DashboardHeader data={data} />

      <SummaryCards summary={data.summary} onOpenDetail={setSelectedDetailId} />

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
          slaBreachCount={data.summary.agingOverSla}
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
