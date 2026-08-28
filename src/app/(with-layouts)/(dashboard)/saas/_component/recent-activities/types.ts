import type { ActivityType, RecentActivitiesRawResponse } from "@/services/api/saas";

export type { RecentActivitiesRawResponse };

export interface RecentActivityViewModel {
  id: string;
  actorName: string;
  activityType: ActivityType;
  description: string;
  relativeTime: string;
}
