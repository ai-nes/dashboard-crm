"use client";

import { useEffect, useState } from "react";
import { RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
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
import StudentAnalysisBriefing from "./student-analysis-briefing";
import StudentAnalysisExplorer from "./student-analysis-explorer";
import {
  buildAnalysisDimensions,
  getInitialAnalysisDimension,
} from "./student-analysis-view";
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
  const items = buildAnalysisDimensions(analysis?.insight.dimensions, labels);
  const previous =
    canReadAiRecommendations && overview?.previous_analysis
      ? buildAnalysisDimensions(
          overview.previous_analysis.insight.dimensions,
          labels,
        )
      : undefined;
  const [selection, setSelection] = useState<{
    studentId: string;
    code: string;
  } | null>(null);
  const [comparison, setComparison] = useState<{
    studentId: string;
    visible: boolean;
  } | null>(null);
  const selectedCode =
    selection?.studentId === analysisTargetId
      ? selection.code
      : getInitialAnalysisDimension(items);
  const showPrevious =
    comparison?.studentId === analysisTargetId ? comparison.visible : true;
  const isLoading =
    isAuthLoading || (canReadAiRecommendations && runQuery.isLoading);
  if (!isAuthLoading && !canReadStudentRecord) return null;

  const analysisButton = canRequestAnalysis ? (
    <Button
      appearance="outline"
      size="sm"
      onPress={request}
      isDisabled={
        isAnalysisActive ||
        isLoading ||
        !analysisTargetId.trim() ||
        overview?.enabled === false
      }
      className="min-h-10"
    >
      {isAnalysisActive ? (
        <RefreshCircle1Clockwise
          size={16}
          className="motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Sparkle size={16} aria-hidden="true" />
      )}
      {isAnalysisActive
        ? "Đang phân tích"
        : analysis
          ? "Phân tích lại"
          : "Phân tích"}
    </Button>
  ) : undefined;

  return (
    <div className="@container min-w-0 space-y-4">
      <div
        className="grid min-w-0 grid-cols-1 items-stretch gap-4 @5xl:grid-cols-4"
        data-student-overview-top-row
      >
        <div className="flex min-w-0 flex-col @5xl:col-span-3">
          <StudentNextBestActions
            data={data}
            studentId={analysisTargetId}
            isAnalysisActive={isAnalysisActive}
            showRunButton={false}
            analysisDisposition={analysis?.nba.disposition}
          />
        </div>
        {canReadAiRecommendations && (
          <div className="min-w-0 space-y-5 @5xl:col-span-1">
            <StudentAnalysisBriefing
              headerAction={analysisButton}
              summary={(trigger) => (
                <StudentInsightCard
                  overview={overview}
                  canRead
                  onAnalyze={canRequestAnalysis ? request : undefined}
                  isBusy={isAnalysisActive}
                  isLoading={isLoading}
                  hasError={Boolean(analysisError)}
                  hasTarget={Boolean(analysisTargetId.trim())}
                  showAnalyze={false}
                  embedded
                  compact
                >
                  {trigger}
                </StudentInsightCard>
              )}
              overview={overview}
              items={items}
              previous={previous}
              selectedCode={selectedCode}
              showPrevious={showPrevious}
              onTogglePrevious={() =>
                setComparison({
                  studentId: analysisTargetId,
                  visible: !showPrevious,
                })
              }
            />
          </div>
        )}
      </div>

      {!canReadAiRecommendations ? (
        <StudentInsightCard
          canRead={false}
          isBusy={isAnalysisActive}
          isLoading={isLoading}
          hasError={Boolean(analysisError)}
          hasTarget={Boolean(analysisTargetId.trim())}
        />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 @5xl:grid-cols-4">
          <aside
            className="order-2 min-w-0 space-y-5 @5xl:col-start-4 @5xl:row-start-1 @5xl:row-span-1"
            aria-label="Đề xuất và tín hiệu học sinh"
          >
            <StudentInsightSignals
              insight={analysis?.insight}
              labels={labels}
              canRead={canReadAiRecommendations}
              isLoading={Boolean(isAnalysisActive || runQuery.isLoading)}
              compact
            />
          </aside>
          <div className="order-1 min-w-0 @5xl:col-span-3 @5xl:col-start-1 @5xl:row-start-1">
            <StudentAnalysisExplorer
              items={items}
              previous={previous}
              selectedCode={selectedCode}
              onSelect={(code) =>
                setSelection({ studentId: analysisTargetId, code })
              }
              isLoading={Boolean(isAnalysisActive || isLoading)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
