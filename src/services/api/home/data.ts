import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  HomeOverviewStatsRawResponse,
  InventoryOverviewRawResponse,
  LastTransactionsRawResponse,
  TopProductsRawResponse,
  TrafficSourcesRawResponse,
} from "./types";
import type { SalesChartRawResponse } from "@/app/(with-layouts)/(dashboard)/(home)/_component/sales-chart/types";

export const homeOverviewStatsRawData = asMockFixture<HomeOverviewStatsRawResponse>(mockData.homeOverviewStatsRawData);
export const salesChartMonthlyRawData = asMockFixture<SalesChartRawResponse>(mockData.salesChartMonthlyRawData);
export const salesChartYearlyRawData = asMockFixture<SalesChartRawResponse>(mockData.salesChartYearlyRawData);
export const inventoryOverviewRawData = asMockFixture<InventoryOverviewRawResponse>(mockData.inventoryOverviewRawData);
export const topProductsRawData = asMockFixture<TopProductsRawResponse>(mockData.topProductsRawData);
export const trafficSourcesRawData = asMockFixture<TrafficSourcesRawResponse>(mockData.trafficSourcesRawData);
export const lastTransactionsRawData = asMockFixture<LastTransactionsRawResponse>(mockData.lastTransactionsRawData);
