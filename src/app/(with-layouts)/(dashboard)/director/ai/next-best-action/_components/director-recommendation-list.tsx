"use client";

import { ChevronRight, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { DirectorNbaRecommendation } from "@/services/api/nba";
import {
  actionLabel,
  formatNbaChannel,
  formatNbaDateTime,
} from "@/services/api/nba/presentation";
import { cn } from "@/utils/cn";

interface DirectorRecommendationListProps {
  recommendations: DirectorNbaRecommendation[];
  selectedId: string | null;
  onSelect: (recommendationId: string) => void;
}

const priorityLabels = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
} as const;

const priorityColors = {
  high: "error",
  medium: "primary",
  low: "gray",
} as const;

export default function DirectorRecommendationList({
  recommendations,
  selectedId,
  onSelect,
}: DirectorRecommendationListProps) {
  return (
    <ol className="divide-y divide-card-border">
      {recommendations.map((recommendation) => {
        const isSelected = recommendation.id === selectedId;

        return (
          <li key={recommendation.id}>
            <button
              type="button"
              onClick={() => onSelect(recommendation.id)}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "group flex w-full items-start gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-background-soft-50 focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring sm:px-5",
                isSelected && "bg-badge-primary-background/35",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isSelected
                    ? "bg-button-primary-background text-button-primary-text"
                    : "bg-background-soft-50 text-text-secondary",
                )}
                aria-hidden="true"
              >
                #{recommendation.rank}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {recommendation.studentName ?? recommendation.studentId}
                  </span>
                  <Badge color={priorityColors[recommendation.priority]}>
                    {priorityLabels[recommendation.priority]}
                  </Badge>
                </span>
                {recommendation.studentName && (
                  <span className="mt-1 block truncate text-xs text-text-secondary">
                    {recommendation.studentId}
                  </span>
                )}
                <span className="mt-2 block text-sm leading-5 text-text-primary">
                  {actionLabel(recommendation.actionId)}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
                  <span className="inline-flex items-center gap-1.5">
                    <ClockThree size={13} aria-hidden="true" />
                    {formatNbaDateTime(recommendation.generatedAt)}
                  </span>
                  {recommendation.channel && (
                    <span>
                      Kênh: {formatNbaChannel(recommendation.channel)}
                    </span>
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
