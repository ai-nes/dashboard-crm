import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  CustomerGrowthRawResponse,
  PlanMixRawResponse,
  RecentActivitiesRawResponse,
  RecentSignupsRawResponse,
  RevenueOverviewRawResponse,
} from "./types";

export const revenueOverviewMonthlyRawData = asMockFixture<RevenueOverviewRawResponse>(mockData.revenueOverviewMonthlyRawData);
export const revenueOverviewYearlyRawData = asMockFixture<RevenueOverviewRawResponse>(mockData.revenueOverviewYearlyRawData);
export const customerGrowthMonthlyRawData = asMockFixture<CustomerGrowthRawResponse>(mockData.customerGrowthMonthlyRawData);
export const customerGrowthYearlyRawData = asMockFixture<CustomerGrowthRawResponse>(mockData.customerGrowthYearlyRawData);
export const planMixRawData = asMockFixture<PlanMixRawResponse>(mockData.planMixRawData);
export const recentSignupsRawData = asMockFixture<RecentSignupsRawResponse>(mockData.recentSignupsRawData);
export const recentActivitiesRawData = asMockFixture<RecentActivitiesRawResponse>(mockData.recentActivitiesRawData);
