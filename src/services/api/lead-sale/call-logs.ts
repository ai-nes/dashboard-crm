import type {
  StudentCallRecord,
  StudentCallSummaryStatus,
} from "@/services/api/students/types";
import { nestRequest } from "@/services/api/nest/nest-client";

export type LeadCallRecord = StudentCallRecord;

export interface LeadCallLogsResponse {
  leadId: string;
  calls: LeadCallRecord[];
  total: number;
}

const DIRECTIONS = new Set(["inbound", "outbound", "missed"]);
const OUTCOMES = new Set(["connected", "missed", "no-answer", "callback"]);
const SUMMARY_STATUSES = new Set(["COMPLETED", "PENDING", "NOT_AVAILABLE"]);

export interface CreateLeadCallPayload {
  direction: "inbound" | "outbound" | "missed";
  outcome: "connected" | "missed" | "no-answer" | "callback";
  occurredAt?: string;
  durationSeconds?: number;
  topic?: string;
  summary?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
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
    ...(typeof row.callerRole === "string"
      ? { callerRole: row.callerRole }
      : {}),
    ...(typeof row.receiverRole === "string"
      ? { receiverRole: row.receiverRole }
      : {}),
    ...(typeof row.phoneNumber === "string"
      ? { phoneNumber: row.phoneNumber }
      : {}),
    ...(typeof row.durationSeconds === "number" &&
    Number.isFinite(row.durationSeconds)
      ? { durationSeconds: Math.max(0, Math.floor(row.durationSeconds)) }
      : {}),
    ...(typeof row.topic === "string" ? { topic: row.topic } : {}),
    ...(typeof row.summary === "string" ? { summary: row.summary } : {}),
    ...(typeof row.summaryAvailable === "boolean"
      ? { summaryAvailable: row.summaryAvailable }
      : {}),
    ...(typeof row.summaryStatus === "string" &&
    SUMMARY_STATUSES.has(row.summaryStatus)
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

function parseCallLogsResponse(value: unknown): LeadCallLogsResponse {
  const payload = asRecord(value);
  if (
    !payload ||
    typeof payload.leadId !== "string" ||
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
    leadId: text(payload.leadId),
    calls,
    total:
      typeof payload.total === "number" && Number.isFinite(payload.total)
        ? Math.max(0, Math.floor(payload.total))
        : calls.length,
  };
}

/** Call history of one lead, from `GET /api/v1/leads/{id}/calls`. */
export async function getLeadCallLogs(
  leadId: string,
): Promise<LeadCallLogsResponse | null> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) return null;

  const result = await nestRequest<{
    data: LeadCallLogsResponse;
  }>(`/api/v1/leads/${encodeURIComponent(normalizedLeadId)}/calls`);
  return parseCallLogsResponse(result.data);
}

export async function createLeadCall(
  leadId: string,
  payload: CreateLeadCallPayload,
): Promise<LeadCallRecord> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId)
    throw new Error("Thiếu Lead cần ghi nhật ký cuộc gọi.");
  const result = await nestRequest<{ data: LeadCallRecord }>(
    `/api/v1/leads/${encodeURIComponent(normalizedLeadId)}/calls`,
    { method: "POST", body: payload },
  );
  const call = normalizeCall(result.data);
  if (!call) throw new Error("Phản hồi ghi nhật ký cuộc gọi không hợp lệ.");
  return call;
}
