import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  AiAgentsRawResponse,
  AiCostAnalyticsRawResponse,
  AiProviderDistributionRawResponse,
  RecentActivitiesRawResponse,
  TopUsageRawResponse,
  WeeklyAiActivityRawResponse,
} from "./types";

export const aiCostAnalyticsMonthlyRawData = asMockFixture<AiCostAnalyticsRawResponse>(mockData.aiCostAnalyticsMonthlyRawData);
export const aiCostAnalyticsYearlyRawData = asMockFixture<AiCostAnalyticsRawResponse>(mockData.aiCostAnalyticsYearlyRawData);
export const weeklyAiActivityRawData = asMockFixture<WeeklyAiActivityRawResponse>(mockData.weeklyAiActivityRawData);
export const topUsageRawData = asMockFixture<TopUsageRawResponse>(mockData.topUsageRawData);
export const aiAgentsRawData = asMockFixture<AiAgentsRawResponse>(mockData.aiAgentsRawData);
export const recentActivitiesRawData = asMockFixture<RecentActivitiesRawResponse>(mockData.recentActivitiesRawData);
export const aiProviderDistributionRawData = asMockFixture<AiProviderDistributionRawResponse>(mockData.aiProviderDistributionRawData);
