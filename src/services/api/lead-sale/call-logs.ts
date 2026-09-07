import { getStudentInteractions } from "@/services/api/students";
import type { StudentCallRecord } from "@/services/api/students/types";

export type LeadCallRecord = StudentCallRecord;

export interface LeadCallLogsResponse {
  leadId: string;
  calls: LeadCallRecord[];
  total: number;
}

const DIRECTIONS = new Set(["inbound", "outbound", "missed"]);
const OUTCOMES = new Set(["connected", "missed", "no-answer", "callback"]);

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
): Promise<LeadCallLogsResponse | null> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) return null;

  const response = await getStudentInteractions(normalizedLeadId);
  if (!response) return null;

  const payload = response as unknown as Record<string, unknown>;
  if (typeof payload.student_id !== "string" || !Array.isArray(payload.calls)) {
    throw new Error("Phản hồi lịch sử cuộc gọi không hợp lệ.");
  }
  const calls = payload.calls
    .map(normalizeCall)
    .filter((call): call is LeadCallRecord => call !== null);
  if (calls.length !== payload.calls.length) {
    throw new Error("Phản hồi lịch sử cuộc gọi không hợp lệ.");
  }

  return {
    leadId: payload.student_id,
    calls,
    total: calls.length,
  };
}
