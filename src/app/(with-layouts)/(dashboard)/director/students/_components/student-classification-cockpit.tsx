"use client";

import {
  CheckCircle1,
  InfoTriangle,
  RefreshCircle1Clockwise,
  Sparkle,
} from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import AnalysisDrawer from "@/components/analysis-runs/analysis-drawer";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
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
  const classification = data.classification;
  const confirmed = classification.reviewStatus === "Đã xác nhận";
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
    <Card className="mt-4 overflow-hidden border-card-border p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 lg:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Vì sao cần chăm sóc học sinh này</CardTitle>
            <Badge color={confirmed ? "success" : "warning"}>
              {confirmed ? (
                <CheckCircle1 size={13} aria-hidden="true" />
              ) : (
                <InfoTriangle size={13} aria-hidden="true" />
              )}
              {classification.reviewStatus || "Chờ xác nhận"}
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Đánh giá và hành động tiếp theo, cập nhật theo tín hiệu mới nhất.
          </p>
        </div>
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
      </CardHeader>

      <div className="grid min-w-0 items-stretch divide-y divide-card-border xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] xl:divide-x xl:divide-y-0">
        <div className="min-w-0 divide-y divide-card-border">
          <StudentDecisionScore data={data} />
        </div>

        <StudentNextAction
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
    </Card>
  );
}
