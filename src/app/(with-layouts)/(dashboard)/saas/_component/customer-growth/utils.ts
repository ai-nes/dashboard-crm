import { formatNumber } from "@/utils/format-number";
import type { CustomerGrowthRawResponse, CustomerGrowthViewModel } from "./types";

export function mapCustomerGrowthResponse(
  raw: CustomerGrowthRawResponse,
): CustomerGrowthViewModel {
  return {
    data: raw.data.map((point) => ({
      name: point.label,
      newSubscribers: point.new_subscribers,
      churnedSubscribers: point.churned_subscribers,
      totalSubscribers: point.total_subscribers,
    })),
    summary: {
      totalSubscribers: raw.summary.total_subscribers,
      subscriberDeltaPercent: raw.summary.subscriber_delta_percent,
      netNewSubscribers: raw.summary.net_new_subscribers,
    },
  };
}

export function formatDelta(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getCustomerGrowthStats(summary: CustomerGrowthViewModel["summary"]) {
  return [
    {
      id: "subscribers",
      label: "Total Subscribers",
      value: formatNumber({ value: summary.totalSubscribers, notation: "standard" }),
      delta: formatDelta(summary.subscriberDeltaPercent),
      isPositive: summary.subscriberDeltaPercent >= 0,
      dotClassName: "bg-brand-500",
    },
    {
      id: "net-new",
      label: "Net New Subscribers",
      value: `+${formatNumber({ value: summary.netNewSubscribers, notation: "standard" })}`,
      delta: formatDelta(summary.subscriberDeltaPercent),
      isPositive: summary.netNewSubscribers >= 0,
      dotClassName: "bg-purple-500",
    },
  ];
}
