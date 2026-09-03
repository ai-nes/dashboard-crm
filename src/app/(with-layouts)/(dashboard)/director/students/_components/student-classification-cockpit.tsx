"use client";

import { Phone, RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import AnalysisDrawer from "@/components/analysis-runs/analysis-drawer";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useAnalysisRun } from "@/hooks/use-analysis-run";
import { studentWorklistKeys } from "@/hooks/use-student-worklist-queries";

import StudentDecisionScore from "./student-decision-score";
import StudentNextBestActions from "./student-next-best-actions";
import StudentNextAction from "./student-next-action";
import type { Student360SectionProps } from "./types";

interface StudentClassificationCockpitProps extends Student360SectionProps {
  analysisTargetId: string;
}

export default function StudentClassificationCockpit({
  data,
  analysisTargetId,
}: StudentClassificationCockpitProps) {
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const { run, request, requestMutation, runQuery } = useAnalysisRun(
    "student",
    analysisTargetId,
  );
  const queryClient = useQueryClient();
  const isAnalysisActive =
    run?.status === "queued" || run?.status === "running";

  useEffect(() => {
    if (run?.status !== "completed" || !analysisTargetId.trim()) return;

    void queryClient.invalidateQueries({
      queryKey: studentWorklistKeys.actions(analysisTargetId),
    });
  }, [analysisTargetId, queryClient, run?.status]);

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
  const analysisButtonLabel = requestMutation.isPending
    ? "Đang gửi"
    : isAnalysisActive
      ? "Đang phân tích"
      : run
        ? "Đánh giá lại"
        : "Phân tích AI";

  return (
    <>
      <div className="mt-4 grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <Card className="min-w-0 overflow-hidden p-0">
          <StudentDecisionScore data={data} />
        </Card>

        <StudentNextBestActions
          analysisAction={
            <Button
              appearance="outline"
              isDisabled={
                !analysisTargetId.trim() ||
                requestMutation.isPending ||
                Boolean(isAnalysisActive)
              }
              onPress={handleAnalysisRequest}
              size="xs"
            >
              {isAnalysisActive || run ? (
                <RefreshCircle1Clockwise
                  className={
                    isAnalysisActive ? "motion-safe:animate-spin" : undefined
                  }
                  size={14}
                  aria-hidden="true"
                />
              ) : (
                <Sparkle size={14} aria-hidden="true" />
              )}
              {analysisButtonLabel}
            </Button>
          }
          callAction={
            <Button
              onPress={() =>
                toast.success(
                  `Đã tạo cuộc gọi tư vấn cho ${data.student.name}.`,
                )
              }
              size="sm"
            >
              <Phone size={16} aria-hidden="true" />
              Gọi tư vấn
            </Button>
          }
          data={data}
          studentId={analysisTargetId}
        />
      </div>

      <div className="mt-4">
        <Card className="min-w-0 overflow-hidden p-0">
          <StudentNextAction
            analysisError={analysisError}
            isAnalysisActive={Boolean(isAnalysisActive)}
            isAwaitingAnalysisResponse={requestMutation.isPending && !run}
            onOpenAnalysisDetails={() => setIsAnalysisDrawerOpen(true)}
            run={run}
          />
        </Card>
      </div>

      {run && (
        <AnalysisDrawer
          isOpen={isAnalysisDrawerOpen}
          kind="student"
          onOpenChange={setIsAnalysisDrawerOpen}
          run={run}
          targetId={analysisTargetId}
          title="Phân tích Học sinh 360"
        />
      )}
    </>
  );
}
