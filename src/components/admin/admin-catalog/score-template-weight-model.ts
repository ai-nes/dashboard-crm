export const SCORE_WEIGHT_DIMENSIONS = [
  {
    id: "fit",
    field: "fit_weight",
    label: "Fit",
    description: "Độ phù hợp",
    hint: "Mức độ phù hợp với hồ sơ.",
    color: "var(--primary-500)",
    defaultValue: 0.4,
  },
  {
    id: "engagement",
    field: "engagement_weight",
    label: "Engagement",
    description: "Tương tác",
    hint: "Mức độ tương tác của lead.",
    color: "var(--info-500)",
    defaultValue: 0.3,
  },
  {
    id: "intent",
    field: "intent_weight",
    label: "Intent",
    description: "Ý định đăng ký",
    hint: "Mức độ thể hiện ý định đăng ký.",
    color: "var(--success-500)",
    defaultValue: 0.3,
  },
] as const;

export type ScoreWeightId = (typeof SCORE_WEIGHT_DIMENSIONS)[number]["id"];
export type ScoreWeightField =
  (typeof SCORE_WEIGHT_DIMENSIONS)[number]["field"];
export type ScoreWeightValues = Record<ScoreWeightId, number>;

export const DEFAULT_SCORE_WEIGHT_VALUES = SCORE_WEIGHT_DIMENSIONS.reduce(
  (values, dimension) => {
    values[dimension.id] = dimension.defaultValue;
    return values;
  },
  {} as ScoreWeightValues,
);
