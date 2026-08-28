import type { ReactNode } from "react";

import type { MarketingOverviewStatsRawResponse } from "@/services/api/marketing";

export type { MarketingOverviewStatsRawResponse };

export interface MarketingStatDisplayConfig {
  title: string;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

export interface MarketingStatViewModel {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}
