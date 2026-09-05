"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  ClockThree,
  Pencil1,
  Xmark,
} from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import type {
  NbaDecisionOperation,
  NbaRecommendation,
} from "@/services/api/nba";

import {
  actionLabel,
  formatNbaDateTime,
  getPermittedOperations,
  NBA_OPERATION_LABELS,
  NBA_PRIORITY_COLORS,
  NBA_PRIORITY_LABELS,
} from "./student-nba-ui";

interface StudentNbaRecommendationCardProps {
  recommendation: NbaRecommendation;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onBeginDecision: (
    recommendation: NbaRecommendation,
    operation: NbaDecisionOperation,
  ) => void;
}

export default function StudentNbaRecommendationCard({
  recommendation,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  onBeginDecision,
}: StudentNbaRecommendationCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const operations = getPermittedOperations(recommendation).filter(
    (operation) => operation !== "DISMISS",
  );
  const hasRevision = Boolean(recommendation.expectedRevision);
  const summary = recommendation.explanation?.summary ?? recommendation.reason;
  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-card-border bg-card-background shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-background-gray-secondary/30 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left text-base font-semibold text-text-primary outline-none transition hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="truncate">{actionLabel(recommendation.actionId)}</span>
          <Badge color={NBA_PRIORITY_COLORS[recommendation.priority]} size="sm">
            {NBA_PRIORITY_LABELS[recommendation.priority]}
          </Badge>
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <EvidenceCount count={recommendation.explanation?.evidence.length ?? 0} />
          <NbaQuickActions
            hasRevision={hasRevision}
            operations={operations}
            onBeginDecision={(operation) =>
              onBeginDecision(recommendation, operation)
            }
          />
          <Badge
            color="orange"
            prefixIcon={
              <span className="text-xs leading-none" aria-hidden="true">
                ✦
              </span>
            }
            title="Đề xuất từ AI"
          >
            AI
          </Badge>
        </div>
      </div>

      {!expanded && (
        <div className="border-t border-card-border px-4 py-5 sm:px-5">
          <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
            {summary || "Chưa có tóm tắt cho đề xuất này."}
          </p>
        </div>
      )}

      {expanded && <NbaRecommendationReasons recommendation={recommendation} />}
    </article>
  );
}

function NbaQuickActions({
  hasRevision,
  operations,
  onBeginDecision,
}: {
  hasRevision: boolean;
  operations: NbaDecisionOperation[];
  onBeginDecision: (operation: NbaDecisionOperation) => void;
}) {
  if (!hasRevision) return null;

  return (
    <div className="flex shrink-0 items-center gap-1" aria-label="Thao tác nhanh">
      {operations.map((operation) => (
        <NbaOperationButton
          key={operation}
          operation={operation}
          onPress={() => onBeginDecision(operation)}
        />
      ))}
    </div>
  );
}

function NbaRecommendationReasons({
  recommendation,
}: {
  recommendation: NbaRecommendation;
}) {
  const explanation = recommendation.explanation;
  const fallback = "Chưa có dữ liệu cho phần này.";
  const summary = recommendation.explanation?.summary ?? recommendation.reason;

  return (
    <div className="space-y-4 border-t border-card-border px-4 py-4 sm:px-5">
      <div className="rounded-lg border border-card-border bg-background-soft-50 px-4 py-3">
        <p className="text-sm font-medium leading-6 text-text-primary">
          {summary || "Chưa có tóm tắt cho đề xuất này."}
        </p>
      </div>

      <div className="divide-y divide-card-border">
        <RecommendationReason
          label="Lý do đề xuất"
          value={explanation?.why_action || recommendation.reason || fallback}
        />
        <RecommendationReason
          label="Tại sao cần làm ngay"
          value={explanation?.why_now || fallback}
        />
        <RecommendationReason
          label="Thời điểm phù hợp"
          value={
            explanation
              ? `${formatNbaDateTime(explanation.timing.recommended_at)} — ${explanation.timing.reason}`
              : fallback
          }
        />
        <RecommendationReason
          label="Thông tin còn thiếu"
          value={explanation?.uncertainty || fallback}
        />
      </div>
    </div>
  );
}

function EvidenceCount({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <p className="text-xs font-medium whitespace-nowrap text-text-tertiary">
      {count} nguồn
    </p>
  );
}

function RecommendationReason({
  label,
  value,
}: {
  label: string;
  value: string;
  }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <p className="mt-1.5 text-sm leading-5 text-text-secondary">{value}</p>
    </div>
  );
}

function NbaOperationButton({
  operation,
  onPress,
}: {
  operation: NbaDecisionOperation;
  onPress: () => void;
}) {
  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <Button
          iconOnly
          size="sm"
          variant={
            operation === "ACCEPT"
              ? "success"
              : operation === "REJECT"
                ? "danger"
                : "primary"
          }
          appearance="outline"
          aria-label={NBA_OPERATION_LABELS[operation]}
          onPress={onPress}
          className={
            operation === "DEFER"
              ? "border-badge-orange-icon-color bg-badge-orange-background text-badge-orange-text hover:bg-badge-orange-background hover:text-badge-orange-text focus:ring-warning-500 data-[focused=true]:ring-warning-500"
              : undefined
          }
        >
          <NbaOperationIcon operation={operation} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{NBA_OPERATION_LABELS[operation]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function NbaOperationIcon({ operation }: { operation: NbaDecisionOperation }) {
  if (operation === "ACCEPT") return <Check size={16} aria-hidden="true" />;
  if (operation === "ACCEPT_WITH_CHANGES") {
    return <Pencil1 size={16} aria-hidden="true" />;
  }
  if (operation === "DEFER") {
    return <ClockThree size={16} aria-hidden="true" />;
  }
  return <Xmark size={16} aria-hidden="true" />;
}
