"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getExchangeStockData,
  getLastStockTransactionsData,
  getMarketNewsData,
  getMarketOverviewData,
  getPortfolioPerformanceData,
  getWatchlistData,
} from "@/services/api/stocks";
import type {
  ExchangeStockRawResponse,
  LastStockTransactionsRawResponse,
  MarketNewsRawResponse,
  MarketOverviewRawResponse,
  PerformanceRange,
  PortfolioPerformanceRawResponse,
  WatchlistRawResponse,
} from "@/services/api/stocks";

export const stocksKeys = {
  all: ["stocks"] as const,
  portfolioPerformance: (range: PerformanceRange = "1M") => ["stocks-portfolio-performance", range] as const,
  watchlist: () => ["stocks-watchlist"] as const,
  exchangeStock: () => ["stocks-exchange-stock"] as const,
  marketOverview: () => ["stocks-market-overview"] as const,
  lastTransactions: () => ["stocks-last-transactions"] as const,
  marketNews: () => ["stocks-market-news"] as const,
};

export function usePortfolioPerformanceQuery<TData = PortfolioPerformanceRawResponse>(
  range: PerformanceRange = "1M",
  options?: Omit<UseQueryOptions<PortfolioPerformanceRawResponse, Error, TData, ReturnType<typeof stocksKeys.portfolioPerformance>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: stocksKeys.portfolioPerformance(range),
    queryFn: () => getPortfolioPerformanceData(range),
    ...options,
  });
}

export function useWatchlistQuery<TData = WatchlistRawResponse>(
  options?: Omit<UseQueryOptions<WatchlistRawResponse, Error, TData, ReturnType<typeof stocksKeys.watchlist>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: stocksKeys.watchlist(),
    queryFn: getWatchlistData,
    ...options,
  });
}

export function useExchangeStockQuery<TData = ExchangeStockRawResponse>(
  options?: Omit<UseQueryOptions<ExchangeStockRawResponse, Error, TData, ReturnType<typeof stocksKeys.exchangeStock>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: stocksKeys.exchangeStock(),
    queryFn: getExchangeStockData,
    ...options,
  });
}

export function useMarketOverviewQuery<TData = MarketOverviewRawResponse>(
  options?: Omit<UseQueryOptions<MarketOverviewRawResponse, Error, TData, ReturnType<typeof stocksKeys.marketOverview>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: stocksKeys.marketOverview(),
    queryFn: getMarketOverviewData,
    ...options,
  });
}

export function useLastStockTransactionsQuery<TData = LastStockTransactionsRawResponse>(
  options?: Omit<UseQueryOptions<LastStockTransactionsRawResponse, Error, TData, ReturnType<typeof stocksKeys.lastTransactions>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: stocksKeys.lastTransactions(),
    queryFn: getLastStockTransactionsData,
    ...options,
  });
}

export function useMarketNewsQuery<TData = MarketNewsRawResponse>(
  options?: Omit<UseQueryOptions<MarketNewsRawResponse, Error, TData, ReturnType<typeof stocksKeys.marketNews>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: stocksKeys.marketNews(),
    queryFn: getMarketNewsData,
    ...options,
  });
}

