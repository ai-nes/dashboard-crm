import {
  ensureRoot,
  FrappeApiError,
  getBaseUrl,
  queryString,
  request as frappeRequest,
} from "../frappe-request";

import type {
  StudentScoreContext,
  StudentScoreHistory,
  StudentScoreHistoryDetail,
  StudentScoreIntent,
  StudentScoreTemplate,
} from "./types";

export type * from "./types";

const METHOD = "crm.api.student_dashboard.get_student_score_context";

export interface StudentScoreContextRequestOptions {
  baseUrl?: string;
}

export class StudentScoreContextApiError extends FrappeApiError {
  constructor(status: number, code: string, message: string) {
    super(status, code, message);
    this.name = "StudentScoreContextApiError";
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

function optionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function rootFor(options: StudentScoreContextRequestOptions): string {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(
    root,
    "Chưa cấu hình API Frappe CRM cho dữ liệu điểm học sinh.",
    StudentScoreContextApiError,
  );
  return root;
}

function normalizeHistoryDetail(value: unknown): StudentScoreHistoryDetail {
  const source = asRecord(value) ?? {};
  return {
    category: optionalString(source.category),
    ruleId: optionalString(source.rule_id ?? source.ruleId),
    signal: optionalString(source.signal),
    score: optionalNumber(source.score) ?? 0,
    reason: optionalString(source.reason),
  };
}

function normalizeHistory(value: unknown): StudentScoreHistory | null {
  const source = asRecord(value);
  if (!source) return null;

  return {
    name: String(source.name ?? ""),
    student: optionalString(source.student),
    scoreTemplate: optionalString(
      source.score_template ?? source.scoreTemplate,
    ),
    scoringTime: optionalString(source.scoring_time ?? source.scoringTime),
    scoringDate: optionalString(source.scoring_date ?? source.scoringDate),
    fitScore: optionalNumber(source.fit_score ?? source.fitScore),
    engagementScore: optionalNumber(
      source.engagement_score ?? source.engagementScore,
    ),
    intentScore: optionalNumber(source.intent_score ?? source.intentScore),
    timeDecayScore: optionalNumber(
      source.time_decay_score ?? source.timeDecayScore,
    ),
    negativeScore: optionalNumber(
      source.negative_score ?? source.negativeScore,
    ),
    finalScore: optionalNumber(source.final_score ?? source.finalScore),
    scoreChange: optionalNumber(source.score_change ?? source.scoreChange),
    triggeredByDoctype: optionalString(
      source.triggered_by_doctype ?? source.triggeredByDoctype,
    ),
    triggeredBy: optionalString(source.triggered_by ?? source.triggeredBy),
    details: Array.isArray(source.details)
      ? source.details.map(normalizeHistoryDetail)
      : [],
  };
}

function normalizeIntent(value: unknown): StudentScoreIntent {
  const source = asRecord(value) ?? {};
  return {
    name: String(source.name ?? ""),
    interaction: optionalString(source.interaction),
    intentType: optionalString(source.intent_type ?? source.intentType),
    intentRole: optionalString(source.intent_role ?? source.intentRole),
    importance: optionalString(source.importance),
    confidence: optionalNumber(source.confidence),
    notes: optionalString(source.notes),
    modified: optionalString(source.modified),
  };
}

function normalizeTemplate(value: unknown): StudentScoreTemplate | null {
  const source = asRecord(value);
  if (!source) return null;

  return {
    name: String(source.name ?? ""),
    templateName: String(source.template_name ?? source.templateName ?? ""),
    status: optionalString(source.status),
    fitWeight: optionalNumber(source.fit_weight ?? source.fitWeight),
    engagementWeight: optionalNumber(
      source.engagement_weight ?? source.engagementWeight,
    ),
    intentWeight: optionalNumber(source.intent_weight ?? source.intentWeight),
    startTime: optionalString(source.start_time ?? source.startTime),
    endTime: optionalString(source.end_time ?? source.endTime),
  };
}

function normalizeContext(value: unknown): StudentScoreContext {
  const source = asRecord(value);
  if (!source || !Array.isArray(source.histories)) {
    throw new StudentScoreContextApiError(
      502,
      "INVALID_SCORE_CONTEXT_RESPONSE",
      "Phản hồi dữ liệu điểm học sinh không hợp lệ.",
    );
  }

  const histories = source.histories
    .map(normalizeHistory)
    .filter((history): history is StudentScoreHistory => history !== null);
  const latest = normalizeHistory(source.latest) ?? histories[0] ?? null;

  return {
    student: optionalString(source.student),
    histories,
    latest,
    intents: Array.isArray(source.intents)
      ? source.intents.map(normalizeIntent)
      : [],
    template: normalizeTemplate(source.template),
  };
}

export async function getStudentScoreContext(
  studentId: string,
  options: StudentScoreContextRequestOptions = {},
): Promise<StudentScoreContext> {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) {
    throw new StudentScoreContextApiError(
      417,
      "INVALID_STUDENT",
      "Cần cung cấp mã học sinh để tải chi tiết điểm.",
    );
  }

  const root = rootFor(options);
  const params = new URLSearchParams({
    student: normalizedStudentId,
    limit: "1",
  });
  const payload = await frappeRequest(
    `${root}/api/method/${METHOD}${queryString(params)}`,
    { method: "GET" },
    root,
    StudentScoreContextApiError,
  );

  return normalizeContext(payload);
}
