import type {
  NbaDecisionOperation,
  NbaRecommendation,
  NbaRecommendationPriority,
} from "@/services/api/nba";
export {
  actionLabel,
  formatNbaChannel,
  formatNbaDateTime,
  getNbaFallbackFacts,
  type NbaFallbackFact,
} from "@/services/api/nba/presentation";

export const NBA_OPERATION_LABELS: Record<NbaDecisionOperation, string> = {
  ACCEPT: "Chấp nhận",
  ACCEPT_WITH_CHANGES: "Chấp nhận có chỉnh sửa",
  REJECT: "Từ chối",
  DEFER: "Trì hoãn",
  DISMISS: "Bỏ qua",
};

const PERMITTED_DECISION_ALIASES: Record<NbaDecisionOperation, string[]> = {
  ACCEPT: ["accepted", "accept"],
  ACCEPT_WITH_CHANGES: ["accepted", "accept_with_changes"],
  REJECT: ["rejected", "reject"],
  DEFER: ["deferred", "defer"],
  DISMISS: ["dismissed", "dismiss"],
};

export const NBA_PRIORITY_LABELS: Record<NbaRecommendationPriority, string> = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
};

export const NBA_PRIORITY_COLORS: Record<
  NbaRecommendationPriority,
  "error" | "primary" | "gray"
> = {
  high: "error",
  medium: "primary",
  low: "gray",
};

export interface DecisionFields {
  reason?: string;
  revisitAt?: string;
  dueAt?: string;
  priority?: NbaRecommendationPriority;
  channel?: string;
}

export function getPermittedOperations(
  recommendation: NbaRecommendation,
): NbaDecisionOperation[] {
  const operations = Object.keys(
    NBA_OPERATION_LABELS,
  ) as NbaDecisionOperation[];
  return operations.filter((operation) =>
    isDecisionPermitted(recommendation, operation),
  );
}

export function isDecisionPermitted(
  recommendation: NbaRecommendation,
  operation: NbaDecisionOperation,
): boolean {
  if (recommendation.permittedDecisions.length === 0) return true;
  const permitted = recommendation.permittedDecisions.map((value) =>
    value.toLowerCase(),
  );
  return PERMITTED_DECISION_ALIASES[operation].some((alias) =>
    permitted.includes(alias),
  );
}

export function toIsoDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
