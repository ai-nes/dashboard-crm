import type { MarketNewsRawResponse } from "@/services/api/stocks";

export type { MarketNewsRawResponse };

export interface MarketNewsItemViewModel {
  id: string;
  headline: string;
  source: string;
  time: string;
  url: string;
}
