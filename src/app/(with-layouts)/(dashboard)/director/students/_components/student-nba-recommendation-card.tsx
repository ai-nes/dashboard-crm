"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Badge } from "@/components/tailgrids/core/badge";
import type {
  NbaDecisionOperation,
  NbaRecommendation,
} from "@/services/api/nba";

import {
  formatNbaDateShort,
  formatNbaTimeOfDay,
  isDecisionPermitted,
  NBA_PRIORITY_COLORS,
  NBA_PRIORITY_LABELS,
} from "./student-nba-ui";

/** The 3 fixed decision slots the card always shows, left to right. */
const CARD_OPERATIONS: NbaDecisionOperation[] = [
  "REJECT",
  "ACCEPT_WITH_CHANGES",
  "ACCEPT",
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
  onPrepareConsultation?: (recommendation: NbaRecommendation) => void;
}

export default function StudentNbaRecommendationCard({
  recommendation,
  onBeginDecision,
  onPrepareConsultation,
}: StudentNbaRecommendationCardProps) {
  const hasRevision = Boolean(recommendation.expectedRevision);
  const scheduledAt =
    recommendation.timing.scheduledAt ?? recommendation.generatedAt;
  const timeLabel = formatNbaTimeOfDay(scheduledAt);
  const dateLabel = formatNbaDateShort(scheduledAt);
  const expiresLabel = formatNbaDateShort(recommendation.timing.expiresAt);
  const reason =
    recommendation.reason ||
    recommendation.context[0] ||
    "Chưa có căn cứ cho đề xuất này.";
  const operations = CARD_OPERATIONS.filter((operation) =>
    isDecisionPermitted(recommendation, operation),
  );

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-2">
          <Badge color={NBA_PRIORITY_COLORS[recommendation.priority]}>
            {NBA_PRIORITY_LABELS[recommendation.priority].toUpperCase()}
          </Badge>
          <span className="shrink-0 text-xs font-medium text-text-tertiary">
            #{recommendation.rank}
          </span>
        </div>

        <h3 className="mt-3 break-words text-lg leading-7 font-semibold text-text-primary">
          {recommendation.action.title}
        </h3>

        <p className="mt-3 max-w-3xl text-sm leading-5 text-text-primary">
          {reason}
        </p>

        {(timeLabel || dateLabel || expiresLabel) && (
          <div className="mt-3 border-t border-card-border pt-3">
            <p className="text-xs font-semibold text-text-tertiary">
              Nên thực hiện
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

        {recommendation.objective && (
          <div className="mt-3 border-t border-card-border pt-3">
            <p className="text-xs font-semibold text-text-tertiary">
              Mục tiêu
            </p>
            <p className="mt-1.5 max-w-3xl text-sm leading-5 text-text-primary">
              {recommendation.objective}
            </p>
          </div>
        )}

        {recommendation.ruleDecision?.salesNextStep || recommendation.explanation?.sales_next_step ? (
          <div className="mt-3 rounded-lg border border-primary-500/20 bg-badge-primary-background px-3 py-2.5">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">Bước tiếp theo</p>
            <p className="mt-1 text-sm leading-5 text-text-primary">
              {recommendation.ruleDecision?.salesNextStep ?? recommendation.explanation?.sales_next_step}
            </p>
          </div>
        ) : null}

        {recommendation.context.length > 0 && (
          <div className="mt-3 border-t border-card-border pt-3">
            <p className="text-xs font-semibold text-text-tertiary">Bối cảnh</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5 text-text-primary">
              {recommendation.context.map((fact, index) => (
                <li key={`${recommendation.id}-context-${index}`}>{fact}</li>
              ))}
            </ul>
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
      {hasRevision && onPrepareConsultation && (
        <div className="border-t border-card-border px-4 py-3 sm:px-5">
          <Button size="sm" appearance="outline" onPress={() => onPrepareConsultation(recommendation)} className="w-full">
            Chuẩn bị tư vấn
          </Button>
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
