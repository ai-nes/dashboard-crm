"use client";

import { RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import AnalysisDrawer from "@/components/analysis-runs/analysis-drawer";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useAnalysisRun } from "@/hooks/use-analysis-run";

import StudentDecisionScore from "./student-decision-score";
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
  const isAnalysisActive =
    run?.status === "queued" || run?.status === "running";
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

        <Card className="min-w-0 overflow-hidden p-0">
          <StudentNextAction
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
            analysisError={analysisError}
            data={data}
            isAnalysisActive={Boolean(isAnalysisActive)}
            isAwaitingAnalysisResponse={requestMutation.isPending && !run}
            onCall={() =>
              toast.success(`Đã tạo cuộc gọi tư vấn cho ${data.student.name}.`)
            }
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
          title="Phân tích Hồ sơ học sinh 360"
        />
      )}
    </>
  );
}
