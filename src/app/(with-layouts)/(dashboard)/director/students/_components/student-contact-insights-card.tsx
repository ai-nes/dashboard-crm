"use client";

import { Sparkle } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { Student360Data } from "@/services/api/students/types";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";

interface StudentContactInsightsCardProps {
  data: Student360Data;
  reportTitle?: string | null;
  policyRevision?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenAskAI?: () => void;
}

export default function StudentContactInsightsCard({
  data,
  reportTitle,
  policyRevision,
  isRefreshing,
  onRefresh,
  onOpenAskAI,
}: StudentContactInsightsCardProps) {
  const timestamp = data.classification.updatedAt
    ? `Cập nhật lúc ${data.classification.updatedAt}${policyRevision ? ` (Chính sách: ${policyRevision})` : ""}`
    : undefined;

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Tín hiệu tư vấn tuyển sinh"
        timestamp={timestamp}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Nguyên văn từ Analysis Run report, không ghép thêm nội dung */}
      {reportTitle ? (
        <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 text-sm leading-relaxed text-text-primary sm:p-5">
          {reportTitle}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 sm:p-5">
          <StudentCardEmptyState message="Chưa có phân tích cho hồ sơ này." />
        </div>
      )}

      {/* Action button */}
      <div className="mt-4">
        <Button
          appearance="outline"
          size="xs"
          onPress={onOpenAskAI}
          className="rounded-full font-medium"
        >
          <Sparkle size={13} aria-hidden="true" />
          <span>Đặt câu hỏi cho AI</span>
        </Button>
      </div>
    </Card>
  );
}
