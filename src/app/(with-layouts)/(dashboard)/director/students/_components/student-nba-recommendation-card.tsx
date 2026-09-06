"use client";

import { ChevronDown, ChevronRight } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import type {
  NbaDecisionOperation,
  NbaRecommendation,
} from "@/services/api/nba";

import {
  formatNbaDateTime,
  formatNbaDecisionStatus,
  getPermittedOperations,
  NBA_OPERATION_DESCRIPTIONS,
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
  const operations = getPermittedOperations(recommendation);
  const hasRevision = Boolean(recommendation.expectedRevision);
  const objective =
    recommendation.objective || "Chưa có mục tiêu cho đề xuất này.";
  const hasPrimaryReason = Boolean(recommendation.reason);
  const reason =
    recommendation.reason ||
    recommendation.context[0] ||
    "Chưa có căn cứ cho đề xuất này.";
  const contextFacts = hasPrimaryReason
    ? []
    : recommendation.context.slice(1, 3);

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Thu gọn" : "Mở rộng"} đề xuất ${recommendation.action.title}`}
            className="flex min-w-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            <span className="text-xs font-semibold text-text-tertiary">
              Việc tiếp theo
            </span>
          </button>
          <Badge color={NBA_PRIORITY_COLORS[recommendation.priority]}>
            {NBA_PRIORITY_LABELS[recommendation.priority]}
          </Badge>
        </div>

        <div className="mt-4 flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-lg leading-7 font-semibold text-text-primary">
              {recommendation.action.title}
            </h3>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 divide-y divide-card-border border-t border-card-border px-4 sm:px-5">
          <RecommendationSection label="Căn cứ">
            <p className="text-sm leading-6 font-medium text-text-primary">
              {reason}
            </p>
            {contextFacts.length > 0 && (
              <ul className="mt-2 space-y-1.5 text-sm leading-5 text-text-secondary">
                {contextFacts.map((fact) => (
                  <li key={fact} className="flex gap-2">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                      aria-hidden="true"
                    />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </RecommendationSection>

          <RecommendationSection label="Mục tiêu">
            <p className="text-sm leading-6 font-medium text-text-primary">
              {objective}
            </p>
          </RecommendationSection>

          <RecommendationSection label="Thời điểm">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-text-primary">
              <TimingValue
                label="Thực hiện từ"
                value={formatNbaDateTime(
                  recommendation.timing.scheduledAt ??
                    recommendation.generatedAt,
                )}
              />
              {recommendation.timing.expiresAt && (
                <TimingValue
                  label="Hạn xử lý"
                  value={formatNbaDateTime(recommendation.timing.expiresAt)}
                />
              )}
            </div>
          </RecommendationSection>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-4 py-4 sm:px-5">
        <Badge
          color={
            recommendation.status.decision === "pending" ? "primary" : "gray"
          }
        >
          {formatNbaDecisionStatus(recommendation.status.decision)}
        </Badge>
        {hasRevision && (
          <DecisionActions
            operations={operations}
            onBeginDecision={(operation) =>
              onBeginDecision(recommendation, operation)
            }
          />
        )}
      </div>
    </article>
  );
}

function RecommendationSection({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <section className="py-4 first:pt-4 last:pb-4">
      <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function TimingValue({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-xs font-medium text-text-secondary">{label}: </span>
      <span>{value}</span>
    </span>
  );
}

function NbaOperationButton({
  operation,
  onPress,
}: {
  operation: NbaDecisionOperation;
  onPress: () => void;
}) {
  const isAccept = operation === "ACCEPT";
  const isDestructive = operation === "REJECT" || operation === "DISMISS";

  return (
    <Button
      size="sm"
      variant={isAccept ? "success" : isDestructive ? "danger" : "primary"}
      appearance={isAccept ? "fill" : "outline"}
      onPress={onPress}
      className="whitespace-nowrap"
    >
      <span>{NBA_OPERATION_LABELS[operation]}</span>
    </Button>
  );
}

function DecisionActions({
  operations,
  onBeginDecision,
}: {
  operations: NbaDecisionOperation[];
  onBeginDecision: (operation: NbaDecisionOperation) => void;
}) {
  const primaryOperation = operations.includes("ACCEPT")
    ? "ACCEPT"
    : operations[0];
  const secondaryOperation =
    primaryOperation === "ACCEPT" && operations.includes("ACCEPT_WITH_CHANGES")
      ? "ACCEPT_WITH_CHANGES"
      : null;
  const overflowOperations = operations.filter(
    (operation) =>
      operation !== primaryOperation && operation !== secondaryOperation,
  );

  if (!primaryOperation) return null;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <NbaOperationButton
        operation={primaryOperation}
        onPress={() => onBeginDecision(primaryOperation)}
      />
      {secondaryOperation && (
        <NbaOperationButton
          operation={secondaryOperation}
          onPress={() => onBeginDecision(secondaryOperation)}
        />
      )}
      {overflowOperations.length > 0 && (
        <DecisionOverflowMenu
          operations={overflowOperations}
          onBeginDecision={onBeginDecision}
        />
      )}
    </div>
  );
}

function DecisionOverflowMenu({
  operations,
  onBeginDecision,
}: {
  operations: NbaDecisionOperation[];
  onBeginDecision: (operation: NbaDecisionOperation) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 items-center justify-center rounded-lg border border-button-primary-outline-stroke bg-button-primary-outline-background px-3 text-sm font-medium text-button-primary-outline-text outline-none transition hover:bg-button-primary-outline-hover-background focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring">
        Khác
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="top end" className="w-64 p-1.5">
        <DropdownMenuSection>
          {operations.map((operation) => (
            <DropdownMenuItem
              key={operation}
              id={operation}
              onAction={() => onBeginDecision(operation)}
              className="flex-col items-start gap-0.5 px-3 py-2"
            >
              <span className="font-medium text-text-primary">
                {NBA_OPERATION_LABELS[operation]}
              </span>
              <span className="text-xs leading-4 text-text-secondary">
                {NBA_OPERATION_DESCRIPTIONS[operation]}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
