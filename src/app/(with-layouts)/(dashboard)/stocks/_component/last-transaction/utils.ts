import type { StockTransactionRawItem } from "@/services/api/stocks";
import type { StockTransactionViewModel } from "./types";

export const SKELETON_ROW_COUNT = 5;

export function formatAmount(value: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function mapStockTransaction(raw: StockTransactionRawItem): StockTransactionViewModel {
  return {
    id: raw.id,
    type: raw.type,
    symbol: raw.symbol,
    companyName: raw.company_name,
    quantity: raw.quantity.toString(),
    price: formatAmount(raw.price.value, raw.price.currency_code),
    total: formatAmount(raw.total.value, raw.total.currency_code),
    time: formatTime(raw.executed_at),
  };
}
