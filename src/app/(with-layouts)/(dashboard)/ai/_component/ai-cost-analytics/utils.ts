import formatCurrency from "@/utils/format-currency";
import { formatNumber } from "@/utils/format-number";
import type { AiCostAnalyticsRawResponse } from "@/services/api/ai";

import { aiCostStatDisplayConfig } from "./data";
import type { AiCostStatViewModel } from "./types";

function formatPreciseCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

export function mapAiCostStats(response: AiCostAnalyticsRawResponse): AiCostStatViewModel[] {
  return response.metrics.map((metric) => {
    const display = aiCostStatDisplayConfig[metric.metric_key];

    const value =
      metric.display_format === "currency_compact"
        ? formatCurrency(metric.current_value)
        : metric.display_format === "currency_precise"
          ? formatPreciseCurrency(metric.current_value)
          : metric.display_format === "integer"
            ? metric.current_value.toLocaleString()
            : formatNumber({ value: metric.current_value });

    return {
      id: metric.id,
      title: display.title,
      value,
      change: `${metric.delta_percent.toFixed(2)}%`,
      isPositive: metric.trend === "up",
      icon: display.icon,
      iconBgClass: display.iconBgClass,
      iconColorClass: display.iconColorClass,
    };
  });
}
