import type { ScoreRule, ScoreRuleKind } from "@/services/api/admin-catalog";

export const SCORE_RULE_KIND_OPTIONS = [
  {
    value: "positive",
    label: "Cộng điểm",
    technicalLabel: "Positive",
    description: "Tăng điểm khi tín hiệu phù hợp xuất hiện.",
  },
  {
    value: "negative",
    label: "Trừ điểm",
    technicalLabel: "Negative",
    description: "Giảm điểm khi tín hiệu rủi ro xuất hiện.",
  },
  {
    value: "time_decay",
    label: "Giảm theo thời gian",
    technicalLabel: "Time decay",
    description: "Giảm tác động của điểm theo số ngày trôi qua.",
  },
] as const satisfies ReadonlyArray<{
  value: ScoreRuleKind;
  label: string;
  technicalLabel: string;
  description: string;
}>;

export function normalizeScoreRuleKind(value?: string): ScoreRuleKind {
  return SCORE_RULE_KIND_OPTIONS.some((option) => option.value === value)
    ? (value as ScoreRuleKind)
    : "positive";
}

export function getScoreRuleKindMeta(value?: string) {
  const kind = normalizeScoreRuleKind(value);
  return SCORE_RULE_KIND_OPTIONS.find((option) => option.value === kind)!;
}

export function createScoreRuleDraft(
  kind: ScoreRuleKind = "positive",
): ScoreRule {
  if (kind === "negative") {
    return {
      rule_kind: kind,
      signal: "",
      penalty_amount: 0,
      cooldown_days: 0,
      max_penalties: 0,
      is_active: true,
    };
  }
  if (kind === "time_decay") {
    return {
      rule_kind: kind,
      max_days: 0,
      multiplier: 1,
      tier_label: "",
      is_active: true,
    };
  }
  return {
    rule_kind: kind,
    signal: "",
    base_points: 0,
    max_points: 0,
    is_active: true,
  };
}

export function getScoreRuleValidationMessage(rule: ScoreRule): string | null {
  const kind = normalizeScoreRuleKind(rule.rule_kind);
  if (kind !== "time_decay" && !rule.signal?.trim()) {
    return "Chọn một tín hiệu đang được sử dụng.";
  }

  const numericFields: Array<[keyof ScoreRule, string]> =
    kind === "positive"
      ? [
          ["base_points", "Điểm cộng cơ bản"],
          ["max_points", "Điểm cộng tối đa"],
        ]
      : kind === "negative"
        ? [
            ["penalty_amount", "Điểm trừ"],
            ["cooldown_days", "Thời gian chờ"],
            ["max_penalties", "Số lần trừ tối đa"],
          ]
        : [
            ["max_days", "Số ngày tối đa"],
            ["multiplier", "Hệ số còn lại"],
          ];

  for (const [field, label] of numericFields) {
    const value = rule[field];
    if (value === undefined || value === null) {
      return `${label} không được để trống.`;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return `${label} phải là số lớn hơn hoặc bằng 0.`;
    }
  }
  if (
    kind === "positive" &&
    rule.base_points !== undefined &&
    rule.max_points !== undefined &&
    rule.max_points < rule.base_points
  ) {
    return "Điểm cộng tối đa phải lớn hơn hoặc bằng điểm cộng cơ bản.";
  }
  return null;
}

export function isScoreRuleComplete(rule: ScoreRule): boolean {
  return getScoreRuleValidationMessage(rule) === null;
}

export function formatScoreRuleEffect(rule: ScoreRule): string {
  const kind = normalizeScoreRuleKind(rule.rule_kind);
  if (kind === "negative") {
    const penalty = rule.penalty_amount ?? 0;
    const cooldown = rule.cooldown_days ?? 0;
    const maxPenalties = rule.max_penalties ?? 0;
    return `−${penalty} điểm · chờ ${cooldown} ngày · tối đa ${maxPenalties} lần`;
  }
  if (kind === "time_decay") {
    return `×${rule.multiplier ?? 1} · sau ${rule.max_days ?? 0} ngày`;
  }
  return `+${rule.base_points ?? 0} điểm · tối đa ${rule.max_points ?? 0}`;
}
