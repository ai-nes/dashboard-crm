"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { formatTerminalReason } from "@/components/analysis-runs/analysis-run-meta";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canAccessStudent,
  getCrmDoctypePermissions,
  getCrmPermissions,
  hasCrmCapability,
} from "@/components/common/auth/permissions";
import { useStudentAnalysis } from "@/hooks/use-student-ai";
import StudentInsightCard from "./student-insight-card";
import StudentAnalysisDimensions from "./student-analysis-dimensions";
import StudentInsightSignals from "./student-insight-signals";
import StudentNextBestActions from "./student-next-best-actions";
import type { StudentScoreBreakdown } from "./student-score-breakdown";
import type { Student360SectionProps } from "./types";

interface StudentClassificationCockpitProps extends Student360SectionProps {
  analysisTargetId: string;
  scoreBreakdown?: StudentScoreBreakdown | null;
  canViewVisual?: boolean;
  sessionUserId?: string;
}

export default function StudentClassificationCockpit({
  data,
  analysisTargetId,
}: StudentClassificationCockpitProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const crmPermissions = getCrmPermissions(user);
  const recommendationPermissions = getCrmDoctypePermissions(
    user,
    "CRM Recommendation",
  );
  const canReadStudentRecord = canAccessStudent(
    crmPermissions.student,
    { owner: data.student.counselor, ownerId: data.student.ownerId },
    user,
  );
  const canReadAiRecommendations =
    !isAuthLoading && canReadStudentRecord && recommendationPermissions.canRead;
  const canRequestAnalysis =
    canReadAiRecommendations &&
    recommendationPermissions.canCreate &&
    hasCrmCapability(user, "recommendation.decide");
  const {
    run,
    overview,
    request,
    requestMutation,
    query: runQuery,
    isActive: isAnalysisActive,
  } = useStudentAnalysis(analysisTargetId, {
    enabled: canReadAiRecommendations,
    canRequest: canRequestAnalysis,
  });
  const analysisError = requestMutation.error ?? runQuery.error;
  const terminalReason =
    run?.terminalReason ??
    run?.stages.find((stage) => stage.terminalReason)?.terminalReason;
  const terminalReasonLabel = formatTerminalReason(terminalReason);

  useEffect(() => {
    if (analysisError)
      toast.error("Chưa thể hoàn tất phân tích 360", {
        description: "Vui lòng thử lại sau.",
      });
  }, [analysisError]);
  useEffect(() => {
    if (terminalReasonLabel)
      toast.warning("Phân tích 360 chưa hoàn tất", {
        description: terminalReasonLabel,
      });
  }, [terminalReasonLabel]);

  const analysis = canReadAiRecommendations ? overview?.analysis : null;
  const labels = canReadAiRecommendations ? overview?.labels : undefined;
  if (!isAuthLoading && !canReadStudentRecord) return null;

  return (
    <div className="min-w-0 space-y-4">
      <StudentNextBestActions
        data={data}
        studentId={analysisTargetId}
        isAnalysisActive={isAnalysisActive}
      />

      <div className="space-y-4">
        <StudentInsightCard
          overview={canReadAiRecommendations ? overview : undefined}
          canRead={canReadAiRecommendations}
          onAnalyze={canRequestAnalysis ? request : undefined}
          isBusy={isAnalysisActive}
          isLoading={
            isAuthLoading || (canReadAiRecommendations && runQuery.isLoading)
          }
          hasError={Boolean(analysisError)}
          hasTarget={Boolean(analysisTargetId.trim())}
        />
        <StudentAnalysisDimensions
          dimensions={analysis?.insight.dimensions}
          labels={labels}
          canRead={canReadAiRecommendations}
          isLoading={Boolean(isAnalysisActive || runQuery.isLoading)}
        />
        <StudentInsightSignals
          insight={analysis?.insight}
          labels={labels}
          canRead={canReadAiRecommendations}
          isLoading={Boolean(isAnalysisActive || runQuery.isLoading)}
        />
      </div>

    </div>
  );
}
