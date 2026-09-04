"use client";

import { Card } from "@/components/tailgrids/core/card";
import { AnalysisRecentChangesList } from "@/components/analysis-runs/analysis-report-signal-lists";
import type { AnalysisRecentChange } from "@/services/api/analysis-runs";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { schoolAnalysisTimestamp } from "./school-analysis-display";

interface SchoolRecentInteractionsCardProps {
  data: SchoolIntelligenceData;
  recentChanges?: AnalysisRecentChange[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SchoolRecentInteractionsCard({
  data,
  recentChanges = [],
  isRefreshing,
  onRefresh,
}: SchoolRecentInteractionsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Nhật ký hoạt động tuyển sinh"
        timestamp={schoolAnalysisTimestamp(data.dataFreshness)}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">Điểm chạm trường (Inbound)</h4>
          </div>
          {recentChanges.length > 0 ? (
            <div className="mt-3">
              <AnalysisRecentChangesList items={recentChanges} variant="plain" />
            </div>
          ) : (
            <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
          )}
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">3 hoạt động gần nhất (Outbound)</h4>
          </div>
          {data.activities.length > 0 ? (
            <ul className="mt-3 divide-y divide-card-border">
              {data.activities
                .map((activity, index) => ({ activity, index }))
                .sort((left, right) => {
                  const rightTime = parseActivityTimestamp(right.activity.date);
                  const leftTime = parseActivityTimestamp(left.activity.date);
                  return rightTime - leftTime || left.index - right.index;
                })
                .slice(0, 3)
                .map(({ activity, index }) => (
                <li
                  key={`${activity.id}-${activity.title}-${activity.date}-${index}`}
                  className="min-w-0 py-3 first:pt-3 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-sm font-semibold text-text-primary text-pretty">
                      {activity.title}
                    </p>
                    <span className="shrink-0 text-xs text-text-tertiary">{activity.date}</span>
                  </div>
                  {activity.outcome && (
                    <p className="mt-1 text-sm leading-5 text-text-secondary text-pretty">
                      {activity.outcome}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-text-tertiary">
                    {activity.status === "scheduled" ? "Đã lên lịch" : "Đã hoàn thành"}
                  </p>
                </li>
                ))}
            </ul>
          ) : (
            <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
          )}
        </div>
      </div>
    </Card>
  );
}

function parseActivityTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}
