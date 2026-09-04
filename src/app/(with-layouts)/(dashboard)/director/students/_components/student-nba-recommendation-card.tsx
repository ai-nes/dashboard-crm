"use client";

import {
  Check,
  ChevronDown,
  ClockThree,
  Pencil1,
  Xmark,
} from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type {
  NbaDecisionOperation,
  NbaExplanation,
  NbaRecommendation,
} from "@/services/api/nba";

import {
  actionLabel,
  formatNbaChannel,
  formatNbaDateTime,
  getNbaFallbackFacts,
  getPermittedOperations,
  NBA_OPERATION_LABELS,
  NBA_PRIORITY_COLORS,
  NBA_PRIORITY_LABELS,
} from "./student-nba-ui";

interface StudentNbaRecommendationCardProps {
  recommendation: NbaRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  onBeginDecision: (
    recommendation: NbaRecommendation,
    operation: NbaDecisionOperation,
  ) => void;
}

export default function StudentNbaRecommendationCard({
  recommendation,
  isSelected,
  onSelect,
  onBeginDecision,
}: StudentNbaRecommendationCardProps) {
  const operations = getPermittedOperations(recommendation).filter(
    (operation) => operation !== "DISMISS",
  );
  const hasRevision = Boolean(recommendation.expectedRevision);

  return (
    <article
      className={
        isSelected
          ? "overflow-hidden rounded-xl border border-primary-300 bg-card-background shadow-sm"
          : "overflow-hidden rounded-xl border border-card-border bg-card-background"
      }
    >
      <div className="flex min-h-11 items-start gap-3 px-4 py-4 sm:px-5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-3 text-left outline-none transition hover:text-text-secondary focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring"
          aria-expanded={isSelected}
          onClick={onSelect}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text">
            #{recommendation.rank}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <Badge color="primary">
                Hành động: {actionLabel(recommendation.actionId)}
              </Badge>
              <Badge color={NBA_PRIORITY_COLORS[recommendation.priority]}>
                {NBA_PRIORITY_LABELS[recommendation.priority]}
              </Badge>
              <Badge color="gray">
                Kênh liên hệ: {formatNbaChannel(recommendation.channel)}
              </Badge>
            </span>
            <span className="mt-1 block text-xs text-text-tertiary">
              Đề xuất lúc {formatNbaDateTime(recommendation.generatedAt)}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          {!isSelected && hasRevision && (
            <div
              className="flex items-center gap-1"
              aria-label="Thao tác nhanh"
            >
              {operations.map((operation) => (
                <Button
                  key={operation}
                  iconOnly
                  size="sm"
                  variant={operation === "ACCEPT" ? "success" : "primary"}
                  appearance="outline"
                  aria-label={NBA_OPERATION_LABELS[operation]}
                  onPress={() => onBeginDecision(recommendation, operation)}
                >
                  <NbaOperationIcon operation={operation} />
                </Button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary outline-none transition hover:bg-background-soft-50 hover:text-text-primary focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring"
            aria-expanded={isSelected}
            aria-label={
              isSelected ? "Thu gọn đề xuất NBA" : "Mở rộng đề xuất NBA"
            }
            onClick={onSelect}
          >
            <ChevronDown
              size={18}
              className={isSelected ? "rotate-180" : undefined}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="border-t border-card-border px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="space-y-4 pt-4">
            <div className="min-w-0 space-y-4">
              <NbaExplanationContent
                explanation={recommendation.explanation}
                fallbackReason={recommendation.reason}
                aiPayload={recommendation.aiPayload}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {hasRevision ? (
                operations.map((operation) => (
                  <Button
                    key={operation}
                    size="sm"
                    variant={operation === "ACCEPT" ? "success" : "primary"}
                    appearance={operation === "ACCEPT" ? "fill" : "outline"}
                    onPress={() => onBeginDecision(recommendation, operation)}
                  >
                    {operation === "ACCEPT" && (
                      <Check size={15} aria-hidden="true" />
                    )}
                    {NBA_OPERATION_LABELS[operation]}
                  </Button>
                ))
              ) : (
                <p className="text-xs leading-5 text-text-tertiary">
                  Đề xuất đang chờ phiên bản xác nhận, nên chưa thể ghi nhận
                  quyết định.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function NbaExplanationContent({
  explanation,
  fallbackReason,
  aiPayload,
}: {
  explanation: NbaExplanation | null;
  fallbackReason: string;
  aiPayload: NbaRecommendation["aiPayload"];
}) {
  if (!explanation) {
    const fallbackFacts = getNbaFallbackFacts(aiPayload);

    return (
      <div className="space-y-3 rounded-lg border border-card-border bg-background-soft-50 p-4">
        <div>
          <p className="text-xs font-semibold text-text-tertiary">
            Lý do đề xuất
          </p>
          <p className="mt-2 text-sm leading-6 text-text-primary">
            {fallbackReason}
          </p>
        </div>
        {fallbackFacts.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {fallbackFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-lg border border-card-border p-3"
              >
                <p className="text-xs font-semibold text-text-tertiary">
                  {fact.label}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-text-secondary">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-text-primary">
        {explanation.summary}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ExplanationBlock
          label="Vì sao hành động này"
          value={explanation.why_action}
        />
        <ExplanationBlock label="Vì sao lúc này" value={explanation.why_now} />
        <ExplanationBlock label="Thời điểm" value={explanation.timing_reason} />
        <ExplanationBlock
          label="Điều còn chưa rõ"
          value={explanation.uncertainty}
        />
      </div>
      {explanation.evidence_summary.length > 0 && (
        <ExplanationList
          label="Dữ kiện hỗ trợ"
          items={explanation.evidence_summary}
        />
      )}
      {explanation.execution_guidance.length > 0 && (
        <ExplanationList
          label="Gợi ý cách làm"
          items={explanation.execution_guidance}
        />
      )}
    </div>
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

function ExplanationBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-card-border p-3">
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <p className="mt-1.5 text-sm leading-5 text-text-secondary">{value}</p>
    </div>
  );
}

function ExplanationList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-5 text-text-secondary">
        {items.map((item, index) => (
          <li key={`${label}-${index}`} className="flex gap-2">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
