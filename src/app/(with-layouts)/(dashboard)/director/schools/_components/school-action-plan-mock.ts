import type { AnalysisReport } from "@/services/api/analysis-runs";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

export interface SchoolActionPlanMock {
  data: SchoolIntelligenceData;
  report: AnalysisReport;
}

/**
 * No live AI analysis report exists yet for a school until an analysis run
 * completes — this is the empty fallback the action-plan cockpit renders
 * until then. `data` passes the real API-sourced school intelligence
 * through unchanged (previously this fabricated relationship/classification/
 * activities, silently overriding real data).
 */
export function buildSchoolActionPlanMock(
  source: SchoolIntelligenceData,
): SchoolActionPlanMock {
  return {
    data: source,
    report: {
      title: null,
      summary: null,
      risks: [],
      recommendations: [],
      missingEvidence: [],
    },
  };
}
