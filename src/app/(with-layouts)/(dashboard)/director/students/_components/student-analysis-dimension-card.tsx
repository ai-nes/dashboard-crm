"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardTitle } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type {
  AiDimension,
  StudentAiLabels,
} from "@/services/api/student-ai/types";
import {
  getDimensionLabel,
  getDimensionLevelColor,
  getDimensionLevelLabel,
  STUDENT_DIMENSIONS,
} from "./student-analysis-display";
import StudentAnalysisDimensionDialog from "./student-analysis-dimension-dialog";

interface StudentAnalysisDimensionCardProps {
  definition: (typeof STUDENT_DIMENSIONS)[number];
  dimension?: AiDimension;
  labels?: StudentAiLabels;
  canRead: boolean;
  isLoading?: boolean;
}

export default function StudentAnalysisDimensionCard({
  definition,
  dimension,
  labels,
  canRead,
  isLoading,
}: StudentAnalysisDimensionCardProps) {
  if (!canRead) return null;
  const label = getDimensionLabel(definition.code, labels);
  const source =
    dimension?.level_source ??
    (["interest", "fit", "barrier"].includes(definition.code) ? "crm" : "ai");
  const hasDetails = Boolean(
    dimension?.evidence?.some(
      (entry) => entry.note?.trim() || entry.ref?.type?.trim(),
    ) || dimension?.missing?.some((item) => item.trim()),
  );

  return (
    <Card className="flex h-full min-w-0 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle level={4} className="text-sm">
          {label}
        </CardTitle>
        {isLoading && !dimension ? (
          <Skeleton className="h-5 w-24" />
        ) : (
          <Badge
            color={dimension ? getDimensionLevelColor(dimension) : "gray"}
            size="sm"
          >
            {dimension
              ? getDimensionLevelLabel(dimension, labels)
              : "Chưa xác định"}
          </Badge>
        )}
      </div>
      {isLoading && !dimension ? (
        <div className="space-y-2" aria-label={`Đang tải phân tích ${label}`}>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : (
        <p className="min-h-10 break-words text-sm leading-6 text-text-secondary">
          {dimension?.summary?.trim() || "Chưa có đánh giá cho chiều này."}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border-primary pt-2">
        <p className="text-xs text-text-secondary">
          Nguồn mức:{" "}
          <span className="font-medium text-text-primary">
            {source === "crm" ? "CRM" : "AI"}
          </span>
        </p>
        {dimension && hasDetails && (
          <StudentAnalysisDimensionDialog
            dimension={dimension}
            labels={labels}
            canRead={canRead}
          />
        )}
      </div>
    </Card>
  );
}
