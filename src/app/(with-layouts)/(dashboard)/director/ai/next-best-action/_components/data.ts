import type { ActionOutcome, RecommendedAction } from "./types";

/**
 * No live API for NBA SLA/outcome summaries yet — keep these empty so the UI
 * renders its standard empty state instead of fabricated numbers.
 */
export const actionSlaSummary = {
  onTimeRate: "-",
  detail: "Chưa có dữ liệu",
};

export const recommendedActions: RecommendedAction[] = [];

export const actionOutcomes: ActionOutcome[] = [];
