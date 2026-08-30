import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  AudienceInsightsRawResponse,
  CampaignVisitorsRawResponse,
  ChannelPerformanceRawResponse,
  ConversionFunnelRawResponse,
  MarketingOverviewStatsRawResponse,
  MarketingTimeRange,
  RecentActivitiesRawResponse,
} from "./types";

export const marketingOverviewStatsRawData = asMockFixture<Record<MarketingTimeRange, MarketingOverviewStatsRawResponse>>(mockData.marketingOverviewStatsRawData);
export const campaignVisitorsRawData = asMockFixture<Record<MarketingTimeRange, CampaignVisitorsRawResponse>>(mockData.campaignVisitorsRawData);
export const audienceInsightsRawData = asMockFixture<AudienceInsightsRawResponse>(mockData.audienceInsightsRawData);
export const conversionFunnelRawData = asMockFixture<ConversionFunnelRawResponse>(mockData.conversionFunnelRawData);
export const channelPerformanceRawData = asMockFixture<ChannelPerformanceRawResponse>(mockData.channelPerformanceRawData);
export const recentActivitiesRawData = asMockFixture<RecentActivitiesRawResponse>(mockData.recentActivitiesRawData);
