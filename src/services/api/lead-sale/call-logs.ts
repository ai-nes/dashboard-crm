import type {
  StudentCallRecord,
  StudentCallSummaryStatus,
} from "@/services/api/students/types";

export type LeadCallRecord = StudentCallRecord;

export interface LeadCallLogsResponse {
  leadId: string;
  calls: LeadCallRecord[];
  total: number;
}

const DIRECTIONS = new Set(["inbound", "outbound", "missed"]);
const OUTCOMES = new Set(["connected", "missed", "no-answer", "callback"]);
const SUMMARY_STATUSES = new Set(["COMPLETED", "PENDING", "NOT_AVAILABLE"]);

export interface LeadCallLogsRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function resolveBaseUrl(options: LeadCallLogsRequestOptions): string {
  return (
    options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? ""
  ).replace(/\/+$/, "");
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: LeadCallLogsRequestOptions,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Contract tests and non-request contexts do not have Next headers.
    }
  }

  return headers;
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function normalizeCall(value: unknown): LeadCallRecord | null {
  const row = asRecord(value);
  const direction = text(row?.direction);
  const outcome = text(row?.outcome);
  if (
    !row ||
    !text(row.id) ||
    !text(row.time) ||
    !DIRECTIONS.has(direction) ||
    !OUTCOMES.has(outcome) ||
    !text(row.callerName) ||
    !text(row.receiverName)
  ) {
    return null;
  }

  return {
    id: text(row.id),
    ...(typeof row.interactionId === "string" && row.interactionId.trim()
      ? { interactionId: row.interactionId }
      : {}),
    ...(typeof row.evidenceId === "string" && row.evidenceId.trim()
      ? { evidenceId: row.evidenceId }
      : {}),
    time: text(row.time),
    direction: direction as LeadCallRecord["direction"],
    outcome: outcome as LeadCallRecord["outcome"],
    callerName: text(row.callerName),
    receiverName: text(row.receiverName),
    ...(typeof row.callerRole === "string" ? { callerRole: row.callerRole } : {}),
    ...(typeof row.receiverRole === "string" ? { receiverRole: row.receiverRole } : {}),
    ...(typeof row.phoneNumber === "string" ? { phoneNumber: row.phoneNumber } : {}),
    ...(typeof row.durationSeconds === "number" && Number.isFinite(row.durationSeconds)
      ? { durationSeconds: Math.max(0, Math.floor(row.durationSeconds)) }
      : {}),
    ...(typeof row.topic === "string" ? { topic: row.topic } : {}),
    ...(typeof row.summary === "string" ? { summary: row.summary } : {}),
    ...(typeof row.summaryAvailable === "boolean" ? { summaryAvailable: row.summaryAvailable } : {}),
    ...(typeof row.summaryStatus === "string" && SUMMARY_STATUSES.has(row.summaryStatus)
      ? { summaryStatus: row.summaryStatus as StudentCallSummaryStatus }
      : {}),
    ...(typeof row.transcript === "string" && row.transcript.trim()
      ? { transcript: row.transcript }
      : {}),
    ...(typeof row.recordingUrl === "string" && row.recordingUrl.trim()
      ? { recordingUrl: row.recordingUrl }
      : {}),
  };
}

/**
 * The Frappe method keeps its historical student name but is Lead-aware:
 * it resolves CRM Lead records and their linked Call Logs server-side.
 */
export async function getLeadCallLogs(
  leadId: string,
  options: LeadCallLogsRequestOptions = {},
): Promise<LeadCallLogsResponse | null> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) return null;

  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    return { leadId: normalizedLeadId, calls: [], total: 0 };
  }

  const url = new URL(
    `${baseUrl}/api/method/crm.api.director_students.get_lead_call_logs`,
  );
  url.searchParams.set("lead_id", normalizedLeadId);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: await requestHeaders(options),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ lịch sử cuộc gọi.");
  }

  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const root = asRecord(raw);
    const message = asRecord(root?.message);
    throw new Error(
      text(asRecord(root?.error)?.message) ||
        text(message?.message) ||
        text(root?.message) ||
        `Không thể tải lịch sử cuộc gọi (${response.status}).`,
    );
  }

  const payload = asRecord(unwrapMessage(raw));
  if (
    !payload ||
    typeof (payload.lead_id ?? payload.leadId) !== "string" ||
    !Array.isArray(payload.calls)
  ) {
    throw new Error("Phản hồi lịch sử cuộc gọi không hợp lệ.");
  }
  const calls = payload.calls
    .map(normalizeCall)
    .filter((call): call is LeadCallRecord => call !== null);
  if (calls.length !== payload.calls.length) {
    throw new Error("Phản hồi lịch sử cuộc gọi không hợp lệ.");
  }

  return {
    leadId: text(payload.lead_id ?? payload.leadId),
    calls,
    total:
      typeof payload.total === "number" && Number.isFinite(payload.total)
        ? Math.max(0, Math.floor(payload.total))
        : calls.length,
  };
}
