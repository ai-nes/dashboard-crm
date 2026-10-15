import {
  SCORE_WEIGHT_DIMENSIONS,
  type ScoreWeightId,
} from "@/components/common/score-weight-dimensions";
import type {
  StudentScoreContext,
  StudentScoreHistoryDetail,
} from "@/services/api/student-score-context";

export interface StudentScoreBreakdownItem {
  id: ScoreWeightId;
  label: string;
  description: string;
  color: string;
  score: number | null;
  weight: number | null;
  contribution: number | null;
  reasons?: StudentScoreHistoryDetail[];
}

export interface StudentScoreBreakdown {
  overallScore: number | null;
  items: StudentScoreBreakdownItem[];
  weightedScore: number | null;
  timeDecayScore: number | null;
  negativeScore: number | null;
  templateName: string | null;
  scoringTime: string | null;
  deductions?: StudentScoreHistoryDetail[];
}

function toPercentage(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const percentage = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, percentage));
}

export function buildStudentScoreBreakdown(
  context: StudentScoreContext | null | undefined,
  overallScore?: number | null,
): StudentScoreBreakdown | null {
  const latest = context?.latest;
  if (!latest) return null;

  const scores: Record<ScoreWeightId, number | null> = {
    fit: latest.fitScore,
    engagement: latest.engagementScore,
    intent: latest.intentScore,
  };
  const weights: Record<ScoreWeightId, number | null> = {
    fit: toPercentage(context.template?.fitWeight ?? null),
    engagement: toPercentage(context.template?.engagementWeight ?? null),
    intent: toPercentage(context.template?.intentWeight ?? null),
  };

  const items = SCORE_WEIGHT_DIMENSIONS.map((dimension) => ({
    id: dimension.id,
    label: dimension.label,
    description: dimension.description,
    color: dimension.color,
    score: scores[dimension.id],
    weight: weights[dimension.id],
    reasons: latest.details.filter(
      (detail) =>
        detail.category?.toLowerCase() === dimension.id && detail.score > 0,
    ),
    contribution:
      scores[dimension.id] !== null && weights[dimension.id] !== null
        ? (scores[dimension.id]! * weights[dimension.id]!) / 100
        : null,
  }));
  return {
    overallScore: overallScore ?? latest.finalScore,
    items,
    weightedScore: items.every((item) => item.contribution !== null)
      ? items.reduce((total, item) => total + item.contribution!, 0)
      : null,
    timeDecayScore: latest.timeDecayScore,
    negativeScore: latest.negativeScore,
    templateName: context.template?.templateName ?? null,
    scoringTime: latest.scoringTime,
    deductions: latest.details.filter(
      (detail) =>
        detail.score < 0 &&
        ["negative", "time_decay"].includes(
          detail.category?.toLowerCase() ?? "",
        ),
    ),
  };
}
