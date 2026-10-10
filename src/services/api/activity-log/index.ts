import type {
  ActivityLogEntry,
  ActivityLogModule,
  ActivityLogSeverity,
  GetActivityLogsParams,
  GetActivityLogsResponse,
} from "./types";

import { NestApiError, nestRequest } from "../nest/nest-client";

export type * from "./types";

export class ActivityLogApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ActivityLogApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
function rawValue(value: unknown): unknown | null {
  return value === undefined ? null : value;
}

function normalizeActivityLog(raw: unknown): ActivityLogEntry {
  const record = asRecord(raw) ?? {};
  const severity: ActivityLogSeverity =
    record.severity === "critical" ? "critical" : "info";

  return {
    eventId: String(record.event_id ?? record.eventId ?? ""),
    action: String(record.action ?? "updated"),
    doctype: String(record.doctype ?? record.ref_doctype ?? ""),
    docname: String(record.docname ?? ""),
    fieldname: (record.fieldname as string | null | undefined) ?? null,
    fieldLabel: (record.field_label as string | null | undefined) ?? null,
    oldValue: rawValue(record.old_value ?? record.oldValue),
    newValue: rawValue(record.new_value ?? record.newValue),
    owner: (record.owner as string | null | undefined) ?? null,
    ownerFullName:
      (record.owner_full_name as string | null | undefined) ?? null,
    occurredAt: String(record.occurred_at ?? record.occurredAt ?? ""),
    eventType: String(record.event_type ?? record.eventType ?? ""),
    category: String(record.category ?? ""),
    severity,
  };
}

export async function getActivityLogs(
  params: GetActivityLogsParams,
): Promise<GetActivityLogsResponse> {
  let data: Record<string, unknown>;
  try {
    data =
      (await nestRequest<Record<string, unknown>>("/api/v1/activity-logs", {
        query: {
          module: params.module,
          actor: params.actor,
          role: params.role,
          severity: params.severity,
          startDate: params.startDate,
          endDate: params.endDate,
          start: params.start ?? 0,
          pageLength: params.pageLength ?? 50,
        },
      })) ?? {};
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new ActivityLogApiError(error.status, error.code, error.message);
    }
    throw error;
  }
  const logs = Array.isArray(data.logs)
    ? data.logs.map(normalizeActivityLog)
    : [];
  return {
    logs,
    total: Number(data.total ?? logs.length),
    start: Number(data.start ?? params.start ?? 0),
    pageLength: Number(data.pageLength ?? params.pageLength ?? 50),
    module: (data.module as ActivityLogModule) ?? params.module,
    tracked: data.tracked !== false,
  };
}
