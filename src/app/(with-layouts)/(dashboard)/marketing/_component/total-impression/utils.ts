import { formatNumber } from "@/utils/format-number";
import { marketingStatDisplayConfig } from "./data";
import type { MarketingOverviewStatsRawResponse } from "@/services/api/marketing";

import type { MarketingStatViewModel } from "./types";

export function mapMarketingOverviewStats(
  response: MarketingOverviewStatsRawResponse,
): MarketingStatViewModel[] {
  return response.metrics.map((metric) => {
    const display = marketingStatDisplayConfig[metric.metric_key];

    return {
      id: metric.id,
      title: display.title,
      value:
        metric.display_format === "percent"
          ? `${metric.current_value.toFixed(2)}%`
          : metric.display_format === "integer"
            ? metric.current_value.toLocaleString()
            : formatNumber({ value: metric.current_value }),
      change: `${metric.delta_percent.toFixed(2)}%`,
      isPositive: metric.trend === "up",
      icon: display.icon,
      iconBgClass: display.iconBgClass,
      iconColorClass: display.iconColorClass,
    };
  });
}
