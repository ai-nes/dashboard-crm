"use client";

import { Card } from "@/components/tailgrids/core/card";
import type { Student360Data } from "@/services/api/students/types";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";

interface StudentRecentInteractionsCardProps {
  data: Student360Data;
  reportSummary?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function StudentRecentInteractionsCard({
  data,
  reportSummary,
  isRefreshing,
  onRefresh,
}: StudentRecentInteractionsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Nhật ký tương tác gần đây"
        timestamp={data.classification.updatedAt ? `Cập nhật lúc ${data.classification.updatedAt}` : undefined}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Nguyên văn từ Analysis Run report */}
      {reportSummary && (
        <p className="mt-3.5 text-sm leading-relaxed text-text-primary text-pretty">{reportSummary}</p>
      )}

      {/* Hai khung Inbound / Outbound, nội dung chờ dữ liệu thật từ API */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">Kênh tiếp cận tuyển sinh (Inbound)</h4>
          </div>
          <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
        </div>

        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">Nhật ký chăm sóc (Outbound)</h4>
          </div>
          <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
        </div>
      </div>
    </Card>
  );
}
