import type { ReactNode } from "react";

import type { ActivityType, RecentActivitiesRawResponse } from "@/services/api/marketing";

export type { RecentActivitiesRawResponse };

export interface ActivityDisplayConfig {
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

export type ActivityDisplayConfigMap = Record<ActivityType, ActivityDisplayConfig>;

export interface ActivityViewModel {
  id: string;
  description: string;
  actor: string;
  relativeTime: string;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}
