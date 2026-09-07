"use client";

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

import { StudentTaskTypeBadge } from "./student-task-badges";
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
  onBeginDecision: (
    recommendation: NbaRecommendation,
    operation: NbaDecisionOperation,
  ) => void;
}

export default function StudentNbaRecommendationCard({
  recommendation,
  onBeginDecision,
}: StudentNbaRecommendationCardProps) {
  const operations = getPermittedOperations(recommendation);
  const hasRevision = Boolean(recommendation.expectedRevision);
  const scheduledAt =
    recommendation.timing.scheduledAt ?? recommendation.generatedAt;
  const scheduleLabel = formatNbaDateTime(scheduledAt);
  const reason =
    recommendation.reason ||
    recommendation.context[0] ||
    "Chưa có căn cứ cho đề xuất này.";

  return (
    <article className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <StudentTaskTypeBadge actionCode={recommendation.action.code} />
            <Badge
              color="gray"
              prefixIcon={
                <span
                  className="size-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
              }
              title={`Thời gian thực hiện: ${scheduleLabel}${recommendation.timing.timezone ? ` · ${recommendation.timing.timezone}` : ""}`}
              className="whitespace-nowrap"
            >
              {scheduleLabel}
            </Badge>
          </div>
          <Badge color={NBA_PRIORITY_COLORS[recommendation.priority]}>
            {NBA_PRIORITY_LABELS[recommendation.priority]}
          </Badge>
        </div>

        <h3 className="mt-3 break-words text-lg leading-7 font-semibold text-text-primary">
          {recommendation.action.title}
        </h3>

        <div className="mt-3 border-t border-card-border pt-3">
          <p className="text-xs font-semibold text-text-tertiary">Lý do</p>
          <p className="mt-1.5 max-w-3xl text-sm leading-5 text-text-primary">
            {reason}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-4 py-3 sm:px-5">
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
