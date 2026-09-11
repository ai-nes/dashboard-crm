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
  | "comment"
  | "communication"
  | "attachment"
  | "call"
  | "note"
  | "task"
  | "interaction"
  | "engagement"
  | "sla"
  | "decision"
  | "consent"
  | string;

export type StudentAuditSource =
  | "Document"
  | "Version"
  | "Deleted Document"
  | "Comment"
  | "Communication"
  | "File"
  | "Call Log"
  | "FCRM Note"
  | "Task"
  | "CRM Action Item"
  | "CRM Interaction"
  | string;

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
  content?: string | null;
  subject?: string | null;
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

export interface SegmentAuditLogsParams {
  segment: string;
  start?: number;
  pageLength?: number;
}

export interface SegmentAuditLogsResponse {
  segment: string;
  logs: StudentAuditLog[];
  total: number;
  start: number;
  pageLength: number;
  readOnly: boolean;
}
