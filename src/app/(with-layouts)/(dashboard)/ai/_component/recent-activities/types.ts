import type { ReactNode } from "react";

import type { ActivityType, RecentActivitiesRawResponse } from "@/services/api/ai";

export type { RecentActivitiesRawResponse };

export interface ActivityDisplayConfig {
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

export interface RecentActivityViewModel {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  relativeTime: string;
}
