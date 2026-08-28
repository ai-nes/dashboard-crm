import type { MarketOverviewRawResponse } from "@/services/api/stocks";

export type { MarketOverviewRawResponse };

export interface MarketOverviewItemViewModel {
  id: string;
  symbol: string;
  companyName: string;
  quantity: string;
  price: string;
  volume: string;
  changePercent: string;
  isPositive: boolean;
  marketCap: string;
}
