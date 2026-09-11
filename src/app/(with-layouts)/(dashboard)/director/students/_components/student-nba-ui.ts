import type {
  NbaDecisionOperation,
  NbaRecommendation,
  NbaRecommendationPriority,
} from "@/services/api/nba";
export {
  actionCode,
  actionLabel,
  formatNbaChannel,
  formatNbaDateShort,
  formatNbaDateTime,
  formatNbaDecisionStatus,
  formatNbaTimeOfDay,
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

export const NBA_OPERATION_DESCRIPTIONS: Record<NbaDecisionOperation, string> =
  {
    ACCEPT: "Tạo Task theo đề xuất",
    ACCEPT_WITH_CHANGES: "Điều chỉnh trước khi tạo Task",
    REJECT: "Đánh dấu đề xuất không phù hợp",
    DEFER: "Chọn thời điểm xem lại",
    DISMISS: "Bỏ khỏi hàng đợi hiện tại",
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

export function formatNbaEvaluationFailure(
  reason: string | null | undefined,
): string {
  const normalized = reason?.trim();
  return normalized
    ? `Đánh giá NBA chưa hoàn tất: ${normalized}. Vui lòng thử lại.`
    : "Đánh giá NBA chưa hoàn tất. Vui lòng thử lại.";
}

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
