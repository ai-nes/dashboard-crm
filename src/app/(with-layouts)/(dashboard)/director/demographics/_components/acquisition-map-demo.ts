/**
 * Backward-compatible aliases for the Acquisition Map fixture.
 * Runtime data now comes from the demographics API payload.
 */
export {
  acquisitionMapData as acquisitionMapDemoData,
  budgetByPlatformRole as budgetByRoleDemo,
  cohortEnrollmentMatrix as cohortEnrollmentDemo,
  costPerEnrolledBySource as costPerEnrolledDemo,
  cumulativeConversion,
  dailySpendLeads as dailySpendLeadsDemo,
  enrollmentLagHistogram,
  firstContactLatency as contactLatencyDemo,
  firstTouchBySource as firstTouchDemo,
  formCompletion,
  formDropoffByField as dropoffByFieldDemo,
  formFunnel,
  handoffDataCompleteness as handoffCompletenessDemo,
  handoffSuccessBySource as handoffSuccessDemo,
  identityMatchBreakdown as identityMatchDemo,
  lastTouchBySource as lastTouchDemo,
  leadQualityBySource as qualityBySourceDemo,
  leadTrendComparison as sameSeasonDemo,
  platformLeadCost,
  submissionTiming,
  touchpointPlatformMatrix as touchpointPlatformDemo,
  validLeadRateTrend,
} from "@/services/api/demographics/acquisition-map-data";

export {
  captureModeComparison as captureModeDemo,
  firstVsLastSource as firstVsLastDemo,
} from "@/services/api/demographics/acquisition-map-data";

export { heatmapScale } from "@/services/api/demographics/acquisition-map-data";
