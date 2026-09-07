"use client";

import { ChevronRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { DirectorNbaRecommendation } from "@/services/api/nba";
import { formatNbaDateTime } from "@/services/api/nba/presentation";
import { cn } from "@/utils/cn";

interface DirectorRecommendationListProps {
  recommendations: DirectorNbaRecommendation[];
  studentNameById: ReadonlyMap<string, string>;
  selectedId: string | null;
  onSelect: (recommendationId: string) => void;
}

const priorityLabels = {
  high: "Cao",
  medium: "Vừa",
  low: "Thấp",
} as const;

const priorityColors = {
  high: "error",
  medium: "primary",
  low: "gray",
} as const;

export default function DirectorRecommendationList({
  recommendations,
  studentNameById,
  selectedId,
  onSelect,
}: DirectorRecommendationListProps) {
  return (
    <ol className="divide-y divide-card-border xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto">
      {recommendations.map((recommendation) => {
        const isSelected = recommendation.id === selectedId;
        const studentName =
          recommendation.studentName ??
          studentNameById.get(recommendation.studentId) ??
          recommendation.studentId;

        return (
          <li key={recommendation.id}>
            <button
              type="button"
              onClick={() => onSelect(recommendation.id)}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "group flex w-full items-start gap-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-background-soft-50 focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring sm:px-5",
                isSelected && "bg-badge-primary-background/35",
              )}
            >
              <span
                className="pt-1 text-xs font-semibold tabular-nums text-text-tertiary"
                aria-hidden="true"
              >
                {String(recommendation.rank).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {studentName}
                  </span>
                  <Badge color={priorityColors[recommendation.priority]}>
                    {priorityLabels[recommendation.priority]}
                  </Badge>
                </span>
                <span className="mt-1 block truncate text-xs text-text-tertiary">
                  {recommendation.target.id}
                </span>
                <span className="mt-2 block truncate text-sm leading-5 text-text-primary">
                  {recommendation.action.title}
                </span>
                <span className="mt-1 block line-clamp-1 text-xs leading-5 text-text-secondary">
                  {(recommendation.objective ?? recommendation.reason) ||
                    "Chưa có mục tiêu cho đề xuất này."}
                </span>
                <span className="mt-1.5 block text-xs text-text-tertiary">
                  {formatNbaDateTime(
                    recommendation.timing.scheduledAt ??
                      recommendation.generatedAt,
                  )}
                </span>
              </span>

              <ChevronRight
                size={18}
                className={cn(
                  "mt-1 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5",
                  isSelected && "text-primary-500",
                )}
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function DirectorRecommendationListSkeleton() {
  return (
    <div
      className="divide-y divide-card-border"
      role="status"
      aria-live="polite"
    >
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-start gap-3 px-4 py-4 sm:px-5">
          <Skeleton className="size-8 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      ))}
      <span className="sr-only">Đang tải các đề xuất NBA</span>
    </div>
  );
}
