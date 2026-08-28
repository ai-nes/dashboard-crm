import type { WatchlistRawItem } from "@/services/api/stocks";
import type { WatchlistItemViewModel } from "./types";

export const SKELETON_ROW_COUNT = 5;

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

export function mapWatchlistItem(raw: WatchlistRawItem): WatchlistItemViewModel {
  return {
    id: raw.id,
    symbol: raw.symbol,
    companyName: raw.company_name,
    price: formatPrice(raw.price.value, raw.price.currency_code),
    changePercent: formatChangePercent(raw.change_percent),
    isPositive: raw.trend === "up",
  };
}
