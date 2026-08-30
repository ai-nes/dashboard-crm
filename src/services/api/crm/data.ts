import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  LeadGrowthRawResponse,
  LeadsReportRawResponse,
  RecentActivitiesRawResponse,
  UpcomingTasksRawResponse,
} from "./types";

export const leadGrowthWeeklyRawData = asMockFixture<LeadGrowthRawResponse>(mockData.leadGrowthWeeklyRawData);
export const leadGrowthMonthlyRawData = asMockFixture<LeadGrowthRawResponse>(mockData.leadGrowthMonthlyRawData);
export const leadGrowthQuarterlyRawData = asMockFixture<LeadGrowthRawResponse>(mockData.leadGrowthQuarterlyRawData);
export const leadsReportRawData = asMockFixture<LeadsReportRawResponse>(mockData.leadsReportRawData);
export const upcomingTasksRawData = asMockFixture<UpcomingTasksRawResponse>(mockData.upcomingTasksRawData);
export const recentActivitiesRawData = asMockFixture<RecentActivitiesRawResponse>(mockData.recentActivitiesRawData);
