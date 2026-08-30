import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  TopChannelsRawResponse,
  TopContentRawResponse,
  TopCountriesRawResponse,
  UsedDevicesRawResponse,
  VisitorsAnalyticsRawResponse,
} from "./types";

export const visitorsAnalyticsWeeklyRawData = asMockFixture<VisitorsAnalyticsRawResponse>(mockData.visitorsAnalyticsWeeklyRawData);
export const visitorsAnalyticsMonthlyRawData = asMockFixture<VisitorsAnalyticsRawResponse>(mockData.visitorsAnalyticsMonthlyRawData);
export const usedDevicesRawData = asMockFixture<UsedDevicesRawResponse>(mockData.usedDevicesRawData);
export const topCountriesRawData = asMockFixture<TopCountriesRawResponse>(mockData.topCountriesRawData);
export const topContentRawData = asMockFixture<TopContentRawResponse>(mockData.topContentRawData);
export const topChannelsRawData = asMockFixture<TopChannelsRawResponse>(mockData.topChannelsRawData);
