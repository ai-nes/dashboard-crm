"use client";

import { Button } from "@/components/tailgrids/core/button";
import type {
  NbaDecisionOperation,
  NbaRecommendation,
} from "@/services/api/nba";

import {
  formatNbaDateShort,
  formatNbaTimeOfDay,
  isDecisionPermitted,
} from "./student-nba-ui";

/** The 3 fixed decision slots the card always shows, left to right. */
const CARD_OPERATIONS: NbaDecisionOperation[] = [
  "ACCEPT",
  "ACCEPT_WITH_CHANGES",
  "REJECT",
];

/** Short call-to-action wording for this card only -- other surfaces (decision
 *  dialogs, history) keep the fuller NBA_OPERATION_LABELS wording. */
const CARD_OPERATION_LABELS: Record<NbaDecisionOperation, string> = {
  ACCEPT: "Đồng ý",
  ACCEPT_WITH_CHANGES: "Chỉnh sửa",
  REJECT: "Từ chối",
  DEFER: "Trì hoãn",
  DISMISS: "Bỏ qua",
};

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
  const hasRevision = Boolean(recommendation.expectedRevision);
  const scheduledAt =
    recommendation.timing.scheduledAt ?? recommendation.generatedAt;
  const timeLabel = formatNbaTimeOfDay(scheduledAt);
  const dateLabel = formatNbaDateShort(scheduledAt);
  const expiresLabel = formatNbaDateShort(recommendation.timing.expiresAt);
  const operations = CARD_OPERATIONS.filter((operation) =>
    isDecisionPermitted(recommendation, operation),
  );

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
        <h3 className="break-words text-lg leading-7 font-semibold text-text-primary">
          {recommendation.action.title}
        </h3>

        {recommendation.objective && (
          <div className="mt-3 border-t border-card-border pt-3">
            <p className="text-xs font-semibold text-text-tertiary">Mục tiêu</p>
            <p className="mt-1.5 max-w-3xl text-sm leading-5 text-text-primary">
              {recommendation.objective}
            </p>
          </div>
        )}

        {(timeLabel || dateLabel || expiresLabel) && (
          <div className="mt-3 border-t border-card-border pt-3">
            <p className="text-xs font-semibold text-text-tertiary">
              Thời gian
            </p>
            <p className="mt-1.5 text-sm leading-5 text-text-primary">
              {[timeLabel, dateLabel].filter(Boolean).join(" · ") ||
                "Chưa xác định"}
            </p>
            {expiresLabel && (
              <p className="mt-0.5 text-sm leading-5 text-text-tertiary">
                Hết hiệu lực: {expiresLabel}
              </p>
            )}
          </div>
        )}
      </div>

      {hasRevision && operations.length > 0 && (
        <div
          className="grid gap-2 border-t border-card-border px-4 py-3 sm:px-5"
          style={{ gridTemplateColumns: `repeat(${operations.length}, 1fr)` }}
        >
          {operations.map((operation) => (
            <NbaOperationButton
              key={operation}
              operation={operation}
              onPress={() => onBeginDecision(recommendation, operation)}
            />
          ))}
        </div>
      )}
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
  const isReject = operation === "REJECT";

  return (
    <Button
      size="sm"
      variant={isAccept ? "success" : isReject ? "danger" : "primary"}
      appearance={isAccept ? "fill" : "outline"}
      onPress={onPress}
      className="w-full whitespace-nowrap"
    >
      <span>{CARD_OPERATION_LABELS[operation]}</span>
    </Button>
  );
}
