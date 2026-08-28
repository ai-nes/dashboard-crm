import type { ExchangeStockCategory, ExchangeStockRawItem } from "@/services/api/stocks";
import type { ExchangeStockItemViewModel } from "./types";

export const SKELETON_ROW_COUNT = 4;

export const CATEGORY_TABS: { id: ExchangeStockCategory; label: string }[] = [
  { id: "trading", label: "Trading" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
];

export function formatPrice(value: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatChangePercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function mapExchangeStockItem(raw: ExchangeStockRawItem): ExchangeStockItemViewModel {
  return {
    id: raw.id,
    symbol: raw.symbol,
    companyName: raw.company_name,
    price: formatPrice(raw.price.value, raw.price.currency_code),
    changePercent: formatChangePercent(raw.change_percent),
    isPositive: raw.trend === "up",
  };
}
