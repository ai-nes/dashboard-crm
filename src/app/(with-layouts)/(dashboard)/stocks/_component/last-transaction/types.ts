import type { LastStockTransactionsRawResponse, StockTransactionType } from "@/services/api/stocks";

export type { LastStockTransactionsRawResponse };

export interface StockTransactionViewModel {
  id: string;
  type: StockTransactionType;
  symbol: string;
  companyName: string;
  quantity: string;
  price: string;
  total: string;
  time: string;
}
