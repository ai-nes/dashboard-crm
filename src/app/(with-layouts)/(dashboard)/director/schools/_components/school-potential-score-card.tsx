"use client";

import { ThumbsDown2, ThumbsUp2 } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";
import { cn } from "@/utils/cn";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import StudentGaugeChart from "../../students/_components/student-gauge-chart";
import {
  displaySchoolValue,
  isPotentialScoreAvailable,
  schoolAnalysisTimestamp,
} from "./school-analysis-display";
import { buildSchoolPotentialNarrative } from "./school-potential-narrative";

interface SchoolPotentialScoreCardProps {
  data: SchoolIntelligenceData;
  modelRevision?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SchoolPotentialScoreCard({
  data,
  modelRevision,
  isRefreshing,
  onRefresh,
}: SchoolPotentialScoreCardProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const score = useMemo(
    () =>
      isPotentialScoreAvailable(data.dataAvailability, data.potentialScore)
        ? data.potentialScore
        : null,
    [data.dataAvailability, data.potentialScore],
  );
  const statusText =
    score === null
      ? undefined
      : score >= 70
        ? "Tiềm năng cao"
        : score >= 40
          ? "Tiềm năng vừa"
          : "Cần chú ý";
  const narrative = buildSchoolPotentialNarrative(data, statusText);
  const sourceCount = [
    data.dataSources.directory,
    data.dataSources.examScore,
    data.dataSources.reportCard,
    data.dataSources.relationship,
  ].filter((value) => displaySchoolValue(value)).length;
  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success(
      type === "up"
        ? "Đã ghi nhận phản hồi tích cực."
        : "Đã ghi nhận góp ý để tinh chỉnh đánh giá.",
    );
  };

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Điểm tiềm năng trường"
        timestamp={
          schoolAnalysisTimestamp(data.dataFreshness) ??
          (modelRevision ? `Model: ${modelRevision}` : undefined)
        }
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-4 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-4">
          <p className="text-sm leading-relaxed text-text-primary text-pretty">
            {narrative}
          </p>

          {sourceCount > 0 && (
            <div className="text-xs font-medium text-text-tertiary">
              {sourceCount} nguồn dữ liệu trường
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-text-tertiary">
            <button
              type="button"
              onClick={() => handleFeedback("up")}
              aria-label="Hữu ích"
              className={cn(
                "cursor-pointer rounded-sm p-1 transition-colors hover:text-text-primary focus:outline-hidden",
                feedback === "up" && "text-primary-600 dark:text-primary-400",
              )}
            >
              <ThumbsUp2 size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleFeedback("down")}
              aria-label="Chưa hữu ích"
              className={cn(
                "cursor-pointer rounded-sm p-1 transition-colors hover:text-text-primary focus:outline-hidden",
                feedback === "down" && "text-error-500",
              )}
            >
              <ThumbsDown2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex min-h-44 justify-center">
          {score === null ? (
            <div
              className="flex items-center justify-center text-sm font-medium text-text-tertiary"
              role="status"
            >
              Chưa có dữ liệu
            </div>
          ) : (
            <StudentGaugeChart
              score={score}
              statusText={statusText}
              label="Điểm tiềm năng trường"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
