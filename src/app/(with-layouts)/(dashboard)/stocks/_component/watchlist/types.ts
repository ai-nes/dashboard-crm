import type { WatchlistRawResponse } from "@/services/api/stocks";

export type { WatchlistRawResponse };

export interface WatchlistItemViewModel {
  id: string;
  symbol: string;
  companyName: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
}
