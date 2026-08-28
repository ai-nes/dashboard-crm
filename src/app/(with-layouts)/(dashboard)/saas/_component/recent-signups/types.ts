import type { RecentSignupsRawResponse } from "@/services/api/saas";

export type { RecentSignupsRawResponse };

export type BadgeColor =
  | "gray"
  | "primary"
  | "error"
  | "warning"
  | "success"
  | "cyan"
  | "sky"
  | "blue"
  | "violet"
  | "purple"
  | "pink"
  | "rose"
  | "orange";

export interface RecentSignupViewModel {
  id: string;
  repName: string;
  planName: string;
  status: string;
  statusColor: BadgeColor;
  mrr: string;
  joined: string;
}
