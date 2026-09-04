"use client";

import { CheckCircle1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisReportItem } from "@/services/api/analysis-runs";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { formatSchoolConfidence } from "./school-analysis-display";

interface SchoolPositiveSignalsCardProps {
  recommendations: AnalysisReportItem[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SchoolPositiveSignalsCard({
  recommendations,
  isRefreshing,
  onRefresh,
}: SchoolPositiveSignalsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Cơ hội phát triển tuyển sinh"
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      <div className="mt-4 space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${recommendation.headline}-${index}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-success-500/30 bg-badge-success-background/40 p-3.5 text-xs text-text-primary dark:border-success-500/50 dark:bg-card-background/60"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <CheckCircle1
                size={16}
                className="mt-0.5 shrink-0 text-success-500"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">
                  {recommendation.headline}
                </p>
                {recommendation.detail && (
                  <p className="mt-1 leading-relaxed text-text-secondary">
                    {recommendation.detail}
                  </p>
                )}
              </div>
            </div>
            <Badge color="success" size="sm" className="shrink-0">
              {formatSchoolConfidence(recommendation.confidence) ??
                (recommendation.kind === "opportunity"
                  ? "Cơ hội"
                  : "Khuyến nghị")}
            </Badge>
          </div>
        ))}
        {recommendations.length === 0 && (
          <StudentCardEmptyState message="Chưa ghi nhận tín hiệu thuận lợi nào cho trường này." />
        )}
      </div>
    </Card>
  );
}
