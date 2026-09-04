"use client";

import {
  ChevronDown,
  RefreshCircle1Clockwise,
  Sparkle,
} from "@tailgrids/icons";
import { useMemo, useState } from "react";

import AnalysisDrawer from "@/components/analysis-runs/analysis-drawer";
import { Button } from "@/components/tailgrids/core/button";
import { useAnalysisRun } from "@/hooks/use-analysis-run";
import { cn } from "@/utils/cn";

import StudentAskAIDialog from "./student-ask-ai-dialog";
import StudentChallengesCard from "./student-challenges-card";
import StudentContactInsightsCard from "./student-contact-insights-card";
import StudentPositiveFeedbackCard from "./student-positive-feedback-card";
import StudentRecentInteractionsCard from "./student-recent-interactions-card";
import StudentSentimentGaugeCard from "./student-sentiment-gauge-card";
import StudentNextBestActions from "./student-next-best-actions";
import type { Student360SectionProps } from "./types";

interface StudentClassificationCockpitProps extends Student360SectionProps {
  analysisTargetId: string;
}

export default function StudentClassificationCockpit({
  data,
  analysisTargetId,
}: StudentClassificationCockpitProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isHealthOpen, setIsHealthOpen] = useState(true);
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);

  const { run, request, requestMutation, runQuery } = useAnalysisRun(
    "student",
    analysisTargetId,
  );
  const isAnalysisActive =
    run?.status === "queued" ||
    run?.status === "running" ||
    requestMutation.isPending;
  const analysisError = requestMutation.error ?? runQuery.error;

  const handleAnalysisRequest = () => {
    if (
      !analysisTargetId.trim() ||
      requestMutation.isPending ||
      isAnalysisActive
    )
      return;
    request({ kind: "student", studentId: analysisTargetId });
  };

  const student360Stage = useMemo(
    () =>
      run?.stages.find((stage) => stage.stageKind === "student_360") ?? null,
    [run],
  );
  const nbaStage = useMemo(
    () =>
      run?.stages.find((stage) => stage.stageKind === "next_best_action") ??
      null,
    [run],
  );
  const report = student360Stage?.report ?? null;
  const risks = report?.risks ?? [];
  const recommendations = report?.recommendations ?? [];

  return (
    <div className="mt-4 space-y-6">
      {analysisError && !isAnalysisActive && (
        <p className="text-xs text-error-600" role="alert">
          Chưa thể hoàn tất phân tích. Bạn có thể thử lại.
        </p>
      )}

      {/* Section 1: Overview */}
      <section aria-labelledby="section-overview-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOverviewOpen((prev) => !prev)}
            className="flex cursor-pointer items-center gap-2 text-base font-semibold text-text-primary transition-colors hover:text-text-secondary focus:outline-hidden"
            aria-expanded={isOverviewOpen}
          >
            <ChevronDown
              size={18}
              className={cn(
                "transition-transform duration-200 text-text-tertiary",
                !isOverviewOpen && "-rotate-90",
              )}
              aria-hidden="true"
            />
            <h2
              id="section-overview-heading"
              className="text-base font-semibold tracking-tight"
            >
              Tổng quan hồ sơ tuyển sinh
            </h2>
          </button>
          <Button
            appearance="outline"
            isDisabled={!analysisTargetId.trim() || isAnalysisActive}
            onPress={handleAnalysisRequest}
            size="xs"
          >
            {isAnalysisActive ? (
              <RefreshCircle1Clockwise
                className="motion-safe:animate-spin"
                size={14}
                aria-hidden="true"
              />
            ) : (
              <Sparkle size={14} aria-hidden="true" />
            )}
            {isAnalysisActive ? "Đang phân tích" : "Phân tích"}
          </Button>
        </div>

        {isOverviewOpen && (
          <div className="space-y-4">
            <div className="space-y-4">
              {/* Supporting contact context */}
              <StudentContactInsightsCard
                data={data}
                reportTitle={report?.title}
                policyRevision={
                  nbaStage?.policyRevision ?? student360Stage?.policyRevision
                }
                isRefreshing={Boolean(isAnalysisActive)}
                onRefresh={handleAnalysisRequest}
                onOpenAskAI={() => setIsAskDialogOpen(true)}
              />

              <StudentNextBestActions
                data={data}
                studentId={analysisTargetId}
              />
            </div>

            {/* Card 2: Recent interactions */}
            <StudentRecentInteractionsCard
              data={data}
              reportSummary={report?.summary}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysisRequest}
            />
          </div>
        )}
      </section>

      {/* Section 2: Health */}
      <section aria-labelledby="section-health-heading" className="space-y-4">
        <button
          type="button"
          onClick={() => setIsHealthOpen((prev) => !prev)}
          className="flex cursor-pointer items-center gap-2 text-base font-semibold text-text-primary transition-colors hover:text-text-secondary focus:outline-hidden"
          aria-expanded={isHealthOpen}
        >
          <ChevronDown
            size={18}
            className={cn(
              "transition-transform duration-200 text-text-tertiary",
              !isHealthOpen && "-rotate-90",
            )}
            aria-hidden="true"
          />
          <h2
            id="section-health-heading"
            className="text-base font-semibold tracking-tight"
          >
            Đánh giá điểm tiềm năng hồ sơ
          </h2>
        </button>

        {isHealthOpen && (
          <div className="space-y-4">
            {/* Card 3: Sentiment & Potential with Speedometer Gauge */}
            <StudentSentimentGaugeCard
              data={data}
              reportSummary={report?.summary}
              modelRevision={student360Stage?.modelRevision}
              policyRevision={student360Stage?.policyRevision}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysisRequest}
            />

            {/* Card 4: Challenges */}
            <StudentChallengesCard
              data={data}
              risks={risks}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysisRequest}
            />

            {/* Card 5: Positive feedback */}
            <StudentPositiveFeedbackCard
              data={data}
              recommendations={recommendations}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysisRequest}
            />
          </div>
        )}
      </section>

      {/* Modal Ask AI */}
      <StudentAskAIDialog
        isOpen={isAskDialogOpen}
        onClose={() => setIsAskDialogOpen(false)}
        data={data}
      />

      {/* Optional Analysis Drawer for deep claims review */}
      {run && (
        <AnalysisDrawer
          isOpen={isAnalysisDrawerOpen}
          kind="student"
          onOpenChange={setIsAnalysisDrawerOpen}
          run={run}
          targetId={analysisTargetId}
          title="Báo cáo phân tích chuyên sâu 360"
        />
      )}
    </div>
  );
}
