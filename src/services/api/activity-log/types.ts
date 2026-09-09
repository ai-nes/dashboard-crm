export type ActivityLogModule =
  | "all"
  | "auth"
  | "lead_student"
  | "segment"
  | "campaign_nba"
  | "permissions";

export type ActivityLogSeverity = "info" | "critical";

export interface ActivityLogEntry {
  eventId: string;
  action: string;
  doctype: string;
  docname: string;
  fieldname: string | null;
  fieldLabel: string | null;
  oldValue: unknown | null;
  newValue: unknown | null;
  owner: string | null;
  ownerFullName: string | null;
  occurredAt: string;
  eventType: string;
  category: string;
  severity: ActivityLogSeverity;
}

export interface GetActivityLogsParams {
  module: ActivityLogModule;
  actor?: string;
  role?: string;
  severity?: ActivityLogSeverity;
  startDate?: string;
  endDate?: string;
  start?: number;
  pageLength?: number;
}

export interface GetActivityLogsResponse {
  logs: ActivityLogEntry[];
  total: number;
  start: number;
  pageLength: number;
  module: ActivityLogModule;
  tracked: boolean;
}
