"use client";

import { Card } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { schoolAnalysisTimestamp } from "./school-analysis-display";

interface SchoolRecentInteractionsCardProps {
  data: SchoolIntelligenceData;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SchoolRecentInteractionsCard({
  data,
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
          <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">Hoạt động phối hợp tuyển sinh (Outbound)</h4>
          </div>
          <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
        </div>
      </div>
    </Card>
  );
}
