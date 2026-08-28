import type { ReactNode } from "react";

import type { AiCostAnalyticsRawResponse } from "@/services/api/ai";

export type { AiCostAnalyticsRawResponse };

export interface AiCostStatDisplayConfig {
  title: string;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

export interface AiCostStatViewModel {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}
