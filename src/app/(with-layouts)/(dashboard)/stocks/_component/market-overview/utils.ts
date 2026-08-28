import type { MarketOverviewRawItem } from "@/services/api/stocks";
import type { MarketOverviewItemViewModel } from "./types";

export const SKELETON_ROW_COUNT = 5;

export function formatPrice(value: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatChangePercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function mapMarketOverviewItem(raw: MarketOverviewRawItem): MarketOverviewItemViewModel {
  return {
    id: raw.id,
    symbol: raw.symbol,
    companyName: raw.company_name,
    quantity: raw.quantity.toString(),
    price: formatPrice(raw.price.value, raw.price.currency_code),
    volume: formatCompact(raw.volume),
    changePercent: formatChangePercent(raw.change_24h_percent),
    isPositive: raw.change_24h_percent >= 0,
    marketCap: `${formatCompact(raw.market_cap.value)}`,
  };
}
