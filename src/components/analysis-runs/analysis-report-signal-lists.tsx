"use client";

import { formatClaimConfidence } from "./analysis-run-meta";
import { Badge } from "@/components/tailgrids/core/badge";
import type {
  AnalysisAdvisorySignal,
  AnalysisRecentChange,
} from "@/services/api/analysis-runs";

interface AnalysisAdvisorySignalListProps {
  items: AnalysisAdvisorySignal[];
}

export function AnalysisAdvisorySignalList({
  items,
}: AnalysisAdvisorySignalListProps) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-4 divide-y divide-card-border border-y border-card-border">
        {items.map((item, index) => (
          <li key={`${item.type}-${item.title}-${index}`} className="py-3 first:pt-3 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {formatSignalType(item.type)}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary text-pretty">
                  {item.title}
                </p>
              </div>
              <ConfidenceBadge confidence={item.confidence} />
            </div>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary text-pretty">
              {item.summary}
            </p>
          </li>
        ))}
    </ul>
  );
}

interface AnalysisRecentChangesListProps {
  items: AnalysisRecentChange[];
  variant?: "card" | "plain";
}

export function AnalysisRecentChangesList({
  items,
  variant = "card",
}: AnalysisRecentChangesListProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={
        variant === "plain"
          ? "min-w-0"
          : "rounded-xl border border-card-border bg-background-soft-50/50 p-4 sm:p-5"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Thay đổi gần đây
        </h4>
        <Badge color="gray" size="sm">
          {items.length}
        </Badge>
      </div>
      <ul className="mt-3 divide-y divide-card-border border-t border-card-border">
        {items.map((item, index) => (
          <li key={`${item.type}-${index}`} className="py-3 first:pt-3 last:pb-0">
            <p className="text-xs font-medium text-text-tertiary">
              {formatSignalType(item.type)}
            </p>
            <p className="mt-1 text-sm leading-6 text-text-primary text-pretty">
              {item.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: AnalysisAdvisorySignal["confidence"];
}) {
  const meta = formatClaimConfidence(confidence);
  if (!meta) return null;

  return (
    <Badge color={meta.color} size="sm" className="shrink-0">
      {meta.label}
    </Badge>
  );
}

export function AnalysisSourceCountBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Badge color="gray" size="sm">
      {count} nguồn
    </Badge>
  );
}

export function getAnalysisSourceCount(
  items: Array<{ evidenceRefs?: string[]; provenanceIds?: string[] }>,
) {
  return new Set(
    items.flatMap((item) => item.evidenceRefs ?? item.provenanceIds ?? []),
  ).size;
}

function formatSignalType(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
}
