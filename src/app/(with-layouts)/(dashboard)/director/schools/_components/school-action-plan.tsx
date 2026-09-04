"use client";

import {
  ChevronDown,
  RefreshCircle1Clockwise,
  Sparkle,
} from "@tailgrids/icons";
import { useMemo, useState } from "react";

import AnalysisActivityFeed from "@/components/analysis-runs/analysis-activity-feed";
import AnalysisDrawer from "@/components/analysis-runs/analysis-drawer";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { useAnalysisRun } from "@/hooks/use-analysis-run";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";
import { cn } from "@/utils/cn";

import { buildSchoolActionPlanMock } from "./school-action-plan-mock";
import SchoolChallengesCard from "./school-challenges-card";
import SchoolContactInsightsCard from "./school-contact-insights-card";
import SchoolPositiveSignalsCard from "./school-positive-signals-card";
import SchoolPotentialScoreCard from "./school-potential-score-card";
import SchoolRecentInteractionsCard from "./school-recent-interactions-card";

interface SchoolActionPlanProps {
  data: SchoolIntelligenceData;
}

const classificationBadgeColor: Record<
  NonNullable<SchoolIntelligenceData["classification"]["group"]>,
  "success" | "primary" | "warning" | "gray"
> = {
  "Trọng điểm": "success",
  "Mở rộng": "primary",
  "Duy trì": "warning",
  "Sàng lọc": "gray",
};

export default function SchoolActionPlan({ data }: SchoolActionPlanProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isPotentialOpen, setIsPotentialOpen] = useState(true);
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const { run, request, requestMutation, runQuery } = useAnalysisRun(
    "school",
    data.school.id,
  );
  const isAnalysisActive =
    run?.status === "queued" ||
    run?.status === "running" ||
    requestMutation.isPending;
  const analysisError = requestMutation.error ?? runQuery.error;
  const school360Stage = useMemo(
    () => run?.stages.find((stage) => stage.stageKind === "school_360") ?? null,
    [run],
  );
  const analysisReport = school360Stage?.report ?? null;
  const schoolActionPlanMock = useMemo(
    () => buildSchoolActionPlanMock(data),
    [data],
  );
  const displayData = schoolActionPlanMock.data;
  const displayReport = schoolActionPlanMock.report;
  const classificationGroup = displayData.classificationResponse?.group;

  const handleAnalysis = () => {
    if (run && !isAnalysisActive) {
      setIsAnalysisDrawerOpen(true);
      return;
    }
    if (!data.school.id || requestMutation.isPending || isAnalysisActive)
      return;
    request({ kind: "school", highSchool: data.school.id });
  };

  const analysisButtonLabel = requestMutation.isPending
    ? "Đang gửi"
    : isAnalysisActive
      ? "Đang phân tích"
      : run
        ? "Xem phân tích"
        : "Phân tích AI";

  return (
    <div className="min-w-0 space-y-6">
      {analysisError && !isAnalysisActive && (
        <p className="text-xs text-error-600" role="alert">
          Chưa thể hoàn tất phân tích. Bạn có thể thử lại.
        </p>
      )}

      {isAnalysisActive && run ? (
        <AnalysisActivityFeed run={run} title="Phân tích School 360" />
      ) : (
        <>
          <SchoolAnalysisSection
            heading="Tổng quan tuyển sinh"
            isOpen={isOverviewOpen}
            onToggle={() => setIsOverviewOpen((previous) => !previous)}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  appearance="outline"
                  isDisabled={
                    !data.school.id ||
                    requestMutation.isPending ||
                    Boolean(isAnalysisActive)
                  }
                  onPress={handleAnalysis}
                  size="xs"
                >
                  {isAnalysisActive || run ? (
                    <RefreshCircle1Clockwise
                      className={
                        isAnalysisActive
                          ? "motion-safe:animate-spin"
                          : undefined
                      }
                      size={14}
                      aria-hidden="true"
                    />
                  ) : (
                    <Sparkle size={14} aria-hidden="true" />
                  )}
                  {analysisButtonLabel}
                </Button>
                {classificationGroup && (
                  <Badge color={classificationBadgeColor[classificationGroup]}>
                    {classificationGroup}
                  </Badge>
                )}
              </div>
            }
          >
            <SchoolContactInsightsCard
              data={displayData}
              report={displayReport}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysis}
              onOpenDetails={
                analysisReport ? () => setIsAnalysisDrawerOpen(true) : undefined
              }
            />
            <SchoolRecentInteractionsCard
              data={displayData}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysis}
            />
          </SchoolAnalysisSection>

          <SchoolAnalysisSection
            heading="Đánh giá điểm tiềm năng trường"
            isOpen={isPotentialOpen}
            onToggle={() => setIsPotentialOpen((previous) => !previous)}
          >
            <SchoolPotentialScoreCard
              data={displayData}
              modelRevision={school360Stage?.modelRevision}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysis}
            />
            <SchoolChallengesCard
              risks={displayReport.risks}
              reportMissingEvidence={displayReport.missingEvidence ?? []}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysis}
            />
            <SchoolPositiveSignalsCard
              recommendations={displayReport.recommendations}
              isRefreshing={Boolean(isAnalysisActive)}
              onRefresh={handleAnalysis}
            />
          </SchoolAnalysisSection>
        </>
      )}

      {run && (
        <AnalysisDrawer
          isOpen={isAnalysisDrawerOpen}
          kind="school"
          onOpenChange={setIsAnalysisDrawerOpen}
          run={run}
          targetId={data.school.id}
          title="Báo cáo phân tích School 360"
        />
      )}
    </div>
  );
}

function SchoolAnalysisSection({
  heading,
  isOpen,
  onToggle,
  actions,
  children,
}: {
  heading: string;
  isOpen: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={heading} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex cursor-pointer items-center gap-2 text-base font-semibold text-text-primary transition-colors hover:text-text-secondary focus:outline-hidden"
          aria-expanded={isOpen}
        >
          <ChevronDown
            size={18}
            className={cn(
              "text-text-tertiary transition-transform duration-200",
              !isOpen && "-rotate-90",
            )}
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold tracking-tight">{heading}</h3>
        </button>
        {actions}
      </div>
      {isOpen && <div className="space-y-4">{children}</div>}
    </section>
  );
}
