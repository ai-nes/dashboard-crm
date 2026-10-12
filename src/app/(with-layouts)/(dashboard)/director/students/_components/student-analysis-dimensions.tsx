"use client";

import { useId, useMemo } from "react";
import type {
  AiDimension,
  StudentAiLabels,
} from "@/services/api/student-ai/types";
import { STUDENT_DIMENSIONS, getDimensionLevelColor } from "./student-analysis-display";
import StudentAnalysisDimensionCard from "./student-analysis-dimension-card";

interface StudentAnalysisDimensionsProps {
  dimensions?: AiDimension[];
  labels?: StudentAiLabels;
  canRead: boolean;
  isLoading?: boolean;
}

export default function StudentAnalysisDimensions({
  dimensions,
  labels,
  canRead,
  isLoading = false,
}: StudentAnalysisDimensionsProps) {
  const headingId = useId();

  const sortedDimensions = useMemo(() => {
    return [...STUDENT_DIMENSIONS].sort((a, b) => {
      const dimA = dimensions?.find((d) => d.code === a.code);
      const dimB = dimensions?.find((d) => d.code === b.code);
      const isGreenA = dimA ? getDimensionLevelColor(dimA) === "success" : false;
      const isGreenB = dimB ? getDimensionLevelColor(dimB) === "success" : false;
      if (isGreenA && !isGreenB) return -1;
      if (!isGreenA && isGreenB) return 1;
      return 0;
    });
  }, [dimensions]);

  if (!canRead) return null;

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={isLoading}
      className="space-y-2"
    >
      <div>
        <h3
          id={headingId}
          className="text-base font-semibold text-text-primary"
        >
          Phân tích 6 chiều
        </h3>
        <p className="mt-0.5 text-sm text-text-secondary">
          Đánh giá từng khía cạnh và xem dẫn chứng từ dữ liệu học sinh.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {sortedDimensions.map((definition) => (
          <StudentAnalysisDimensionCard
            key={definition.code}
            definition={definition}
            dimension={dimensions?.find(
              (dimension) => dimension.code === definition.code,
            )}
            labels={labels}
            canRead={canRead}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
