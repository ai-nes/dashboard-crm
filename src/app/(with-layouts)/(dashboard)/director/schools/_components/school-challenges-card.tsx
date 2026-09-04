"use client";

import { InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisReportItem } from "@/services/api/analysis-runs";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { formatSchoolConfidence } from "./school-analysis-display";

interface SchoolChallengesCardProps {
  risks: AnalysisReportItem[];
  reportMissingEvidence: string[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SchoolChallengesCard({
  risks,
  reportMissingEvidence,
  isRefreshing,
  onRefresh,
}: SchoolChallengesCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Rào cản hợp tác tuyển sinh"
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      <div className="mt-4 space-y-3">
        {risks.map((risk, index) => (
          <div
            key={`${risk.headline}-${index}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-warning-500/30 bg-badge-warning-background/40 p-3.5 text-xs text-text-primary dark:border-warning-500/50 dark:bg-card-background/60"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <InfoTriangle
                size={16}
                className="mt-0.5 shrink-0 text-warning-500"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">
                  {risk.headline}
                </p>
                {risk.detail && (
                  <p className="mt-1 leading-relaxed text-text-secondary">
                    {risk.detail}
                  </p>
                )}
              </div>
            </div>
            {formatSchoolConfidence(risk.confidence) && (
              <Badge color="warning" size="sm" className="shrink-0">
                {formatSchoolConfidence(risk.confidence)}
              </Badge>
            )}
          </div>
        ))}
        {reportMissingEvidence.length > 0 && risks.length === 0 && (
          <div className="rounded-xl border border-warning-500/30 bg-badge-warning-background p-3.5 text-xs dark:border-warning-500/50">
            <p className="font-semibold text-warning-800 dark:text-warning-200">
              Dữ liệu còn thiếu
            </p>
            <p className="mt-1 leading-relaxed text-warning-800 dark:text-warning-200">
              {reportMissingEvidence.join(" · ")}
            </p>
          </div>
        )}
        {risks.length === 0 && reportMissingEvidence.length === 0 && (
          <StudentCardEmptyState message="Chưa ghi nhận rào cản nào cho trường này." />
        )}
      </div>
    </Card>
  );
}
