import {
  ensureRoot,
  FrappeApiError,
  getBaseUrl,
  queryString,
  request as frappeRequest,
} from "../frappe-request";
import type {
  StudentCampaignHistory,
  StudentCampaignParticipation,
} from "./types";

export type * from "./types";

const METHOD = "crm.api.student_engagement.get_student_context";
const HISTORY_LIMIT = 50;

export class StudentCampaignHistoryApiError extends FrappeApiError {
  constructor(status: number, code: string, message: string) {
    super(status, code, message);
    this.name = "StudentCampaignHistoryApiError";
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

function normalizeCampaignDetails(value: unknown) {
  const row = asRecord(value);
  if (!row) return null;
  const details = {
    stableCode: optionalString(row.stable_code ?? row.stableCode),
    status: optionalString(row.status),
    campaignType: optionalString(row.campaign_type ?? row.campaignType),
    eventType: optionalString(row.event_type ?? row.eventType),
    startDate: optionalString(row.start_date ?? row.startDate),
    endDate: optionalString(row.end_date ?? row.endDate),
  };
  return Object.values(details).some(Boolean) ? details : null;
}

function normalizeEventDetails(value: unknown) {
  const row = asRecord(value);
  if (!row) return null;
  const details = {
    eventDate: optionalString(row.event_date ?? row.eventDate),
    startDatetime: optionalString(row.start_datetime ?? row.startDatetime),
    endDatetime: optionalString(row.end_datetime ?? row.endDatetime),
    location: optionalString(row.location),
  };
  return Object.values(details).some(Boolean) ? details : null;
}

function normalizeParticipation(
  value: unknown,
): StudentCampaignParticipation | null {
  const row = asRecord(value);
  if (!row || (row.kind !== "campaign" && row.kind !== "event")) return null;
  const label = optionalString(row.label);
  if (!label) return null;
  return {
    label,
    campaign: optionalString(row.campaign),
    event: optionalString(row.event),
    kind: row.kind,
    status: optionalString(row.status),
    occurredAt: optionalString(row.occurred_at ?? row.occurredAt),
    campaignDetails: normalizeCampaignDetails(
      row.campaign_details ?? row.campaignDetails,
    ),
    eventDetails: normalizeEventDetails(row.event_details ?? row.eventDetails),
  };
}

export async function getStudentCampaignHistory(
  studentId: string,
  options: { baseUrl?: string } = {},
): Promise<StudentCampaignHistory> {
  const student = studentId.trim();
  if (!student) {
    throw new StudentCampaignHistoryApiError(
      417,
      "INVALID_STUDENT",
      "Cần mã CRM Student để tải lịch sử chiến dịch.",
    );
  }

  const root = getBaseUrl(options.baseUrl);
  ensureRoot(
    root,
    "Chưa cấu hình API Frappe CRM cho lịch sử chiến dịch.",
    StudentCampaignHistoryApiError,
  );
  const params = new URLSearchParams({
    student,
    history_limit: String(HISTORY_LIMIT),
  });
  const payload = await frappeRequest(
    `${root}/api/method/${METHOD}${queryString(params)}`,
    { method: "GET" },
    root,
    StudentCampaignHistoryApiError,
  );
  const admissions = asRecord(asRecord(payload)?.admissions_context);
  if (!admissions || !Array.isArray(admissions.campaign_history)) {
    throw new StudentCampaignHistoryApiError(
      502,
      "INVALID_CAMPAIGN_HISTORY_RESPONSE",
      "Phản hồi lịch sử chiến dịch không hợp lệ.",
    );
  }

  return {
    campaigns: admissions.campaign_history
      .map(normalizeParticipation)
      .filter(
        (item): item is StudentCampaignParticipation => item !== null,
      ),
  };
}
