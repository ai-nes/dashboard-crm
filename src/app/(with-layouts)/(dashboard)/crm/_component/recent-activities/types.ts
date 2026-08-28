import type { ActivityType } from "@/services/api/crm";

export type { ActivityType };

export interface ActivityViewModel {
  id: string;
  type: ActivityType;
  actorName: string;
  description: string;
  relativeTime: string;
}
