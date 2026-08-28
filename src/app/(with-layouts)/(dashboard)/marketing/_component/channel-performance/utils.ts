import { formatNumber } from "@/utils/format-number";
import type { ChannelPerformanceRawItem } from "@/services/api/marketing";

import type { ChannelPerformanceViewModel } from "./types";

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function toChannelPerformanceViewModel(
  raw: ChannelPerformanceRawItem,
): ChannelPerformanceViewModel {
  return {
    id: raw.id,
    channel: raw.channel_name,
    spend: formatMoney(raw.spend_amount, raw.currency_code),
    clicks: formatNumber({ value: raw.click_count }),
    conversionRate: `${raw.conversion_rate.toFixed(2)}%`,
    revenue: formatMoney(raw.revenue_amount, raw.currency_code),
  };
}
