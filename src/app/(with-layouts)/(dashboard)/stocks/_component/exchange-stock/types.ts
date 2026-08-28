import type { ExchangeStockCategory, ExchangeStockRawResponse } from "@/services/api/stocks";

export type { ExchangeStockCategory, ExchangeStockRawResponse };

export interface ExchangeStockItemViewModel {
  id: string;
  symbol: string;
  companyName: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
}
