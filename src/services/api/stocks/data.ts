import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type {
  ExchangeStockRawResponse,
  LastStockTransactionsRawResponse,
  MarketNewsRawResponse,
  MarketOverviewRawResponse,
  PerformanceRange,
  PortfolioPerformanceRawResponse,
  WatchlistRawResponse,
} from "./types";

const portfolioPerformanceByRange = asMockFixture<Record<PerformanceRange, PortfolioPerformanceRawResponse>>(mockData.portfolioPerformanceByRange);

export function getPortfolioPerformanceRawData(
  range: PerformanceRange,
): PortfolioPerformanceRawResponse {
  return portfolioPerformanceByRange[range];
}

export const watchlistRawData = asMockFixture<WatchlistRawResponse>(mockData.watchlistRawData);
export const exchangeStockRawData = asMockFixture<ExchangeStockRawResponse>(mockData.exchangeStockRawData);
export const marketOverviewRawData = asMockFixture<MarketOverviewRawResponse>(mockData.marketOverviewRawData);
export const lastStockTransactionsRawData = asMockFixture<LastStockTransactionsRawResponse>(mockData.lastStockTransactionsRawData);
export const marketNewsRawData = asMockFixture<MarketNewsRawResponse>(mockData.marketNewsRawData);
