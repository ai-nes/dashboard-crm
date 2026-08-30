export * from "@/services/api/demographics/data";
export {
  demandOverviewData as overviewDemandTrendData,
  audienceCompositionData,
  regionalDemandMatrixData,
} from "@/services/api/demographics/data";

// Compatibility aliases
import {
  audienceCompositionData,
  demandOverviewData,
  regionalDemandMatrixData,
} from "@/services/api/demographics/data";

export const overviewDemandTrend = demandOverviewData.trend;
export const demandMomentumTrend = demandOverviewData.trend;
export const demandMomentumSummary = demandOverviewData.summary;
export const audienceGender = audienceCompositionData.gender;
export const audienceProfiles = audienceCompositionData.profiles;
export const audienceTotalProspects = audienceCompositionData.total;
export const audienceGenderData = audienceCompositionData.gender;
export const audienceProfileHighlights = audienceCompositionData.profiles;
export const regionalDemandMatrix = regionalDemandMatrixData.rows.map((row) => ({
  interest: row.interest,
  hcm: row.scores.hcm ?? 0,
  dongNai: row.scores["dong-nai"] ?? 0,
  binhDuong: row.scores["binh-duong"] ?? 0,
  canTho: row.scores["can-tho"] ?? 0,
  daNang: row.scores["da-nang"] ?? 0,
}));
