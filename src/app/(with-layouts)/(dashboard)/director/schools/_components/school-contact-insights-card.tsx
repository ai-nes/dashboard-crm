"use client";

import { ArrowRight, InfoTriangle } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisReport } from "@/services/api/analysis-runs";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { schoolAnalysisTimestamp } from "./school-analysis-display";

interface SchoolContactInsightsCardProps {
  data: SchoolIntelligenceData;
  report: AnalysisReport | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenDetails?: () => void;
}

export default function SchoolContactInsightsCard({
  data,
  report,
  isRefreshing,
  onRefresh,
  onOpenDetails,
}: SchoolContactInsightsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Tín hiệu tuyển sinh tại trường"
        timestamp={schoolAnalysisTimestamp(data.dataFreshness)}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Nguyên văn từ Analysis Run report, không ghép thêm nội dung */}
      {report?.title || report?.summary ? (
        <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 text-sm leading-relaxed text-text-primary sm:p-5">
          {report.title && <p className="font-semibold">{report.title}</p>}
          {report.summary && <p className="mt-1 text-text-secondary">{report.summary}</p>}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 sm:p-5">
          <StudentCardEmptyState message="Chưa có phân tích cho trường này." />
        </div>
      )}

      {report && onOpenDetails && (
        <div className="mt-4 flex items-center gap-2">
          <Button appearance="ghost" size="xs" onPress={onOpenDetails}>
            <InfoTriangle size={14} aria-hidden="true" />
            Xem toàn bộ kết quả
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  );
}
