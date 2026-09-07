export type StudentAuditAction = "created" | "updated" | "deleted";

export type StudentAuditChangeType = "added" | "changed" | "removed";

export type StudentAuditCategory =
  | "record"
  | "data"
  | "status"
  | "lifecycle"
  | "assignment"
  | "processing"
  | "conversion"
  | "outcome"
  | string;

export type StudentAuditSource = "Document" | "Version" | "Deleted Document";

export interface StudentAuditLog {
  eventId: string;
  action: StudentAuditAction;
  changeType: StudentAuditChangeType | null;
  doctype: string;
  docname: string;
  fieldname: string | null;
  fieldLabel: string | null;
  oldValue: unknown | null;
  newValue: unknown | null;
  owner: string | null;
  ownerFullName: string | null;
  occurredAt: string;
  source: StudentAuditSource | string;
  sourceName: string;
  eventType?: string | null;
  category?: StudentAuditCategory | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  restored?: boolean;
}

export interface StudentAuditLogsParams {
  student: string;
  start?: number;
  pageLength?: number;
}

export interface StudentAuditLogsResponse {
  student: string;
  logs: StudentAuditLog[];
  total: number;
  start: number;
  pageLength: number;
  readOnly: boolean;
}

export interface LeadAuditLogsParams {
  lead: string;
  start?: number;
  pageLength?: number;
}
