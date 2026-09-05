import type {
  MockAction,
  MockActionType,
  MockRecommendation,
  MockRecommendationRule,
  MockTimingPolicy,
} from "./types";

/**
 * No live admin API for action/recommendation configuration yet — keep
 * these empty so the tables render their standard "no data" empty row
 * instead of fabricated rows.
 */
export const MOCK_ACTION_TYPES: MockActionType[] = [];

export const MOCK_ACTIONS: MockAction[] = [];

export const MOCK_TIMING_POLICIES: MockTimingPolicy[] = [];

export const MOCK_RECOMMENDATION_RULES: MockRecommendationRule[] = [];

export const MOCK_RECOMMENDATIONS: MockRecommendation[] = [];
