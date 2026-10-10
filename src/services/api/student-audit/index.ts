import type {
  LeadAuditLogsParams,
  SegmentAuditLogsParams,
  SegmentAuditLogsResponse,
  StudentAuditLog,
  StudentAuditLogsParams,
  StudentAuditLogsResponse,
} from "./types";

import { NestApiError, nestRequest } from "../nest/nest-client";

export type * from "./types";

export class StudentAuditApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudentAuditApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function optionalString(value: unknown): string | null {
  return value === null || value === undefined || value === ""
    ? null
    : String(value);
}

function optionalRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeChangeType(value: unknown): StudentAuditLog["changeType"] {
  return value === "added" || value === "changed" || value === "removed"
    ? value
    : null;
}

function normalizeAuditLog(raw: unknown): StudentAuditLog {
  const source = asRecord(raw) || {};
  const sourceName = String(source.source_name ?? source.sourceName ?? "");
  const occurredAt = String(source.occurred_at ?? source.occurredAt ?? "");
  const eventId = String(
    source.event_id ??
      source.eventId ??
      `${sourceName}:${occurredAt}:${source.action ?? "unknown"}`,
  );

  return {
    eventId,
    action: (source.action === "created" ||
    source.action === "updated" ||
    source.action === "deleted"
      ? source.action
      : "updated") as StudentAuditLog["action"],
    changeType: normalizeChangeType(source.changeType ?? source.change_type),
    doctype: String(source.doctype ?? "CRM Lead"),
    docname: String(source.docname ?? ""),
    fieldname: optionalString(source.fieldname),
    fieldLabel: optionalString(source.field_label ?? source.fieldLabel),
    oldValue: source.old_value ?? source.oldValue ?? null,
    newValue: source.new_value ?? source.newValue ?? null,
    owner: optionalString(source.owner),
    ownerFullName: optionalString(
      source.owner_full_name ?? source.ownerFullName,
    ),
    occurredAt,
    source: String(source.source ?? ""),
    sourceName,
    eventType: optionalString(source.event_type ?? source.eventType),
    category: optionalString(source.category),
    content: optionalString(source.content),
    subject: optionalString(source.subject),
    reason: optionalString(source.reason),
    metadata: optionalRecord(source.metadata),
    restored:
      typeof source.restored === "boolean" ? source.restored : undefined,
  };
}

/** Student, Lead and Segment histories come from the Nest backend. */
async function getNestAuditLogs(
  kind: "students" | "leads" | "segments",
  entityId: string,
  params: { start?: number; pageLength?: number },
): Promise<StudentAuditLogsResponse> {
  try {
    const data = await nestRequest<Record<string, unknown>>(
      `/api/v1/${kind}/${encodeURIComponent(entityId)}/audit-logs`,
      {
        query: {
          start: params.start ?? 0,
          pageLength: params.pageLength ?? 100,
        },
      },
    );
    const logs = Array.isArray(data?.logs) ? data.logs : [];
    return {
      student: String(data?.[kind.slice(0, -1)] ?? entityId),
      logs: logs.map(normalizeAuditLog),
      total: Number(data?.total ?? logs.length),
      start: Number(data?.start ?? params.start ?? 0),
      pageLength: Number(data?.pageLength ?? params.pageLength ?? 100),
      readOnly: data?.readOnly !== false,
    };
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new StudentAuditApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

async function getAuditLogs(
  kind: "students" | "leads" | "segments",
  params: { id: string; start?: number; pageLength?: number },
  entityLabel: string,
): Promise<StudentAuditLogsResponse> {
  const entityId = params.id.trim();
  if (!entityId) {
    throw new StudentAuditApiError(
      417,
      "INVALID_STUDENT",
      `Cần cung cấp mã ${entityLabel} để tải nhật ký.`,
    );
  }
  return getNestAuditLogs(kind, entityId, params);
}

export async function getStudentAuditLogs(
  params: StudentAuditLogsParams,
): Promise<StudentAuditLogsResponse> {
  return getAuditLogs(
    "students",
    { id: params.student, start: params.start, pageLength: params.pageLength },
    "học sinh",
  );
}

export async function getLeadAuditLogs(
  params: LeadAuditLogsParams,
): Promise<StudentAuditLogsResponse> {
  return getAuditLogs(
    "leads",
    { id: params.lead, start: params.start, pageLength: params.pageLength },
    "Lead",
  );
}

export async function getSegmentAuditLogs(
  params: SegmentAuditLogsParams,
): Promise<SegmentAuditLogsResponse> {
  const result = await getAuditLogs(
    "segments",
    { id: params.segment, start: params.start, pageLength: params.pageLength },
    "segment",
  );

  return {
    segment: result.student,
    logs: result.logs,
    total: result.total,
    start: result.start,
    pageLength: result.pageLength,
    readOnly: result.readOnly,
  };
}
