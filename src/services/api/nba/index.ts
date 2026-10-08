import { NestApiError } from "../nest/nest-client";
import { nestNbaHandler } from "../nest/nest-nba-router";
import { NOT_HANDLED } from "../nest/nest-handler";
import type {
  NbaDecisionRequest,
  NbaDecisionResponse,
  NbaEvaluationRunResponse,
  NbaEvaluationReference,
  NbaExplanation,
  NbaRecommendation,
  DirectorNbaRecommendation,
  DirectorNbaRecommendationsMeta,
  DirectorNbaRecommendationsParams,
  DirectorNbaRecommendationsResponse,
  StudentNbaWorklistResponse,
} from "./types";
import { actionLabel } from "./presentation";

export type * from "./types";

const STUDENT_WORKLIST_METHOD =
  "crm.api.student_worklist.list_student_worklist";
const DECIDE_RECOMMENDATION_METHOD =
  "crm.api.student_decision.decide_recommendation";
const RUN_STUDENT_NBA_METHOD =
  "crm.api.copilot_delegation.run_student_nba_evaluation";
const DIRECTOR_RECOMMENDATIONS_METHOD =
  "crm.api.director_next_best_action.get_director_recommendations";

export class NbaApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "NbaApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asObject(value: unknown): Record<string, unknown> {
  return asRecord(value) ?? {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeRuleDecision(
  value: unknown,
): NbaRecommendation["ruleDecision"] {
  const record = asRecord(value);
  if (!record) return null;
  const outcome = text(record.outcome);
  if (!outcome) return null;
  return {
    outcome,
    matchedRuleIds: stringArray(
      record.matched_rule_ids ?? record.matchedRuleIds,
    ).slice(0, 50),
    reasonCodes: stringArray(record.reason_codes ?? record.reasonCodes).slice(
      0,
      12,
    ),
    businessReason: text(record.business_reason ?? record.businessReason),
    salesNextStep: text(record.sales_next_step ?? record.salesNextStep),
    affectedActions: stringArray(
      record.affected_actions ?? record.affectedActions,
    ).slice(0, 30),
    ruleVersion: text(record.rule_version ?? record.ruleVersion),
    ruleVersionDigest: text(
      record.rule_version_digest ?? record.ruleVersionDigest,
    ),
    rulesetDigest: text(record.ruleset_digest ?? record.rulesetDigest),
  };
}

function normalizeEvaluation(value: unknown): NbaEvaluationReference {
  const record = asRecord(value) ?? {};
  return {
    id: text(record.id) ?? "",
    disposition:
      record.disposition === "WAIT" ||
      record.disposition === "NO_ACTION" ||
      record.disposition === "ABSTAIN"
        ? record.disposition
        : "RECOMMEND",
    status: text(record.status) ?? "unknown",
  };
}

function normalizeExplanation(value: unknown): NbaExplanation | null {
  const record =
    asRecord(value) ??
    (typeof value === "string"
      ? (() => {
          try {
            return asRecord(JSON.parse(value));
          } catch {
            return null;
          }
        })()
      : null);
  if (!record) return null;

  const summary = text(record.summary);
  const whyAction = text(record.why_action);
  const whyNow = text(record.why_now);
  const uncertainty = text(record.uncertainty);
  const action = asRecord(record.action);
  const timing = asRecord(record.timing);
  const actionCode = text(action?.code);
  const actionTitle = text(action?.title);
  const recommendedAt = text(timing?.recommended_at);
  const timingReason = text(timing?.reason);
  if (
    !summary ||
    !whyAction ||
    !whyNow ||
    !uncertainty ||
    !actionCode ||
    !actionTitle ||
    !recommendedAt ||
    !timingReason
  ) {
    return null;
  }

  if (!Array.isArray(record.evidence)) return null;
  const evidence: NbaExplanation["evidence"] = [];
  for (const item of record.evidence) {
    const evidenceItem = asRecord(item);
    const evidenceSummary = text(evidenceItem?.summary);
    const evidenceRef = text(evidenceItem?.evidence_ref);
    if (!evidenceSummary || !evidenceRef) return null;
    evidence.push({ summary: evidenceSummary, evidence_ref: evidenceRef });
  }

  return {
    action: { code: actionCode, title: actionTitle },
    summary,
    why_action: whyAction,
    why_now: whyNow,
    evidence,
    uncertainty,
    timing: { recommended_at: recommendedAt, reason: timingReason },
    sales_next_step: text(record.sales_next_step ?? record.salesNextStep),
  };
}

function normalizeRecommendation(
  value: unknown,
  options: { allowMissingReason?: boolean } = {},
): NbaRecommendation | null {
  const record = asRecord(value);
  if (!record) return null;

  const target = asRecord(record.target);
  const viewAction = asRecord(record.action);
  const id = text(record.id) ?? text(record.recommendation);
  const studentId =
    text(record.studentId) ?? text(record.student_id) ?? text(target?.id);
  const actionId =
    text(record.actionId) ?? text(record.action_id) ?? text(viewAction?.code);
  const reason = text(record.reason);
  if (
    !id ||
    !studentId ||
    !actionId ||
    (!reason && !options.allowMissingReason)
  ) {
    return null;
  }

  const aiPayload =
    asRecord(record.aiPayload) ?? asRecord(record.ai_payload) ?? {};
  const priority =
    record.priority === "high" || record.priority === "low"
      ? record.priority
      : "medium";
  const explanationSource =
    record.explanationSource === "model" ||
    record.explanation_source === "model"
      ? "model"
      : null;
  const explanation = normalizeExplanation(
    record.explanation ?? record.explanation_json ?? record.explanationJson,
  );
  const ruleDecision = normalizeRuleDecision(
    record.rule_decision ??
      record.ruleDecision ??
      aiPayload.rule_decision ??
      aiPayload.ruleDecision,
  );
  const status = asRecord(record.status);
  const timing = asRecord(record.timing);
  const context = Array.isArray(record.context)
    ? record.context.filter(
        (item): item is string =>
          typeof item === "string" && item.trim() !== "",
      )
    : [];

  return {
    id,
    target: {
      type: text(target?.type) ?? "CRM Lead",
      id: studentId,
    },
    action: {
      code: text(viewAction?.code) ?? actionId,
      title:
        text(viewAction?.title) ??
        explanation?.action.title ??
        actionLabel(actionId),
    },
    rank: number(record.rank, 1),
    recommendationKey:
      text(record.recommendationKey) ?? text(record.recommendation_key) ?? id,
    studentId,
    studentName: text(record.studentName) ?? text(record.student_name),
    actionId,
    priority,
    channel: text(record.channel),
    reason: reason ?? "",
    objective: text(record.objective),
    context,
    timing: {
      scheduledAt:
        text(timing?.scheduled_at) ??
        text(timing?.scheduledAt) ??
        explanation?.timing.recommended_at ??
        null,
      expiresAt: text(timing?.expires_at) ?? text(timing?.expiresAt),
      timezone: text(timing?.timezone),
    },
    status: {
      lifecycle: text(status?.lifecycle) ?? "proposed",
      decision: text(status?.decision) ?? "pending",
      execution: text(status?.execution) ?? "not_started",
    },
    aiPayload,
    explanation,
    ruleDecision,
    explanationSource,
    evaluation: normalizeEvaluation(record.evaluation),
    generatedAt: text(record.generatedAt) ?? text(record.generated_at) ?? "",
    expectedRevision:
      text(record.expected_revision) ?? text(record.expectedRevision),
    revision: text(record.revision),
    permittedDecisions: stringArray(
      record.permitted_decisions ?? record.permittedDecisions,
    ),
  };
}

function normalizeDirectorRecommendation(
  value: unknown,
): DirectorNbaRecommendation | null {
  const record = asRecord(value);
  if (!record) return null;

  const normalized = normalizeRecommendation(record, {
    allowMissingReason: true,
  });
  return normalized ? { ...normalized, reason: text(record.reason) } : null;
}

function normalizeDirectorRecommendationsMeta(
  value: unknown,
): DirectorNbaRecommendationsMeta {
  const record = asRecord(value);
  if (!record) throw new Error("meta must be an object");

  const status = record.status === "empty" ? "empty" : "available";
  const metricKind =
    record.metricKind === "observational" ? "observational" : null;
  if (!metricKind) throw new Error("meta.metricKind is invalid");

  return {
    admissionYear: number(record.admissionYear, new Date().getFullYear()),
    asOf: text(record.asOf) ?? "",
    timezone: text(record.timezone) ?? "Asia/Ho_Chi_Minh",
    status,
    count: number(record.count, 0),
    limit: number(record.limit, 50),
    metricKind,
    metricDisclaimer:
      text(record.metricDisclaimer) ??
      "Số liệu mô tả trạng thái lịch sử, không phải kết quả nhân quả hay dự báo.",
  };
}

/** Runs one NBA operation through the Nest adapter. */
async function callNba(
  method: string,
  params: Record<string, string | undefined>,
  body: Record<string, unknown> | undefined,
  unavailable: { code: string; message: string },
): Promise<Record<string, unknown>> {
  try {
    const result = await nestNbaHandler(method, params, body);
    if (result === NOT_HANDLED) {
      throw new NbaApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return asObject(result);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new NbaApiError(
        error.status,
        error.status === 503 ? unavailable.code : error.code,
        error.status === 503 ? unavailable.message : error.message,
      );
    }
    throw error;
  }
}

export async function getDirectorNbaRecommendations(
  params: DirectorNbaRecommendationsParams = {},
): Promise<DirectorNbaRecommendationsResponse> {
  const root = await callNba(
    DIRECTOR_RECOMMENDATIONS_METHOD,
    {
      ...(params.admissionYear !== undefined
        ? { admissionYear: String(params.admissionYear) }
        : {}),
      limit: String(Math.min(Math.max(params.limit ?? 50, 1), 200)),
    },
    undefined,
    {
      code: "DIRECTOR_NBA_RECOMMENDATIONS_UNAVAILABLE",
      message: "Không thể kết nối tới hàng đợi đề xuất NBA.",
    },
  );

  try {
    if (!Array.isArray(root.recommendations)) {
      throw new Error("recommendations must be an array");
    }

    return {
      meta: normalizeDirectorRecommendationsMeta(root.meta),
      recommendations: root.recommendations.flatMap((item) => {
        const normalized = normalizeDirectorRecommendation(item);
        return normalized ? [normalized] : [];
      }),
    };
  } catch {
    throw new NbaApiError(
      502,
      "INVALID_DIRECTOR_NBA_RECOMMENDATIONS_RESPONSE",
      "Phản hồi hàng đợi đề xuất NBA không hợp lệ.",
    );
  }
}

export async function getStudentNbaWorklist(
  params: { cursor?: string; pageSize?: number; studentId?: string } = {},
): Promise<StudentNbaWorklistResponse> {
  const query: Record<string, string> = {
    page_size: String(Math.min(Math.max(params.pageSize ?? 50, 1), 50)),
  };
  if (params.cursor) query.cursor = params.cursor;
  if (params.studentId?.trim()) query.student_id = params.studentId.trim();

  const root = await callNba(STUDENT_WORKLIST_METHOD, query, undefined, {
    code: "STUDENT_NBA_UNAVAILABLE",
    message: "Không thể kết nối tới hàng đợi đề xuất NBA.",
  });
  if (!Array.isArray(root.items)) {
    throw new NbaApiError(
      502,
      "INVALID_STUDENT_NBA_RESPONSE",
      "Phản hồi hàng đợi đề xuất NBA không hợp lệ.",
    );
  }

  return {
    items: root.items.flatMap((item) => {
      const normalized = normalizeRecommendation(item);
      return normalized ? [normalized] : [];
    }),
    nextCursor: text(root.next_cursor) ?? text(root.nextCursor),
    policyVersion: text(root.policy_version) ?? text(root.policyVersion),
    emptyReason: text(root.empty_reason) ?? text(root.emptyReason),
  };
}

export async function runStudentNbaEvaluation(request: {
  studentId: string;
  forceRerunReason?: string;
}): Promise<NbaEvaluationRunResponse> {
  const studentId = request.studentId.trim();
  if (!studentId) {
    throw new NbaApiError(
      422,
      "INVALID_STUDENT_ID",
      "Không xác định được học sinh cần chạy NBA.",
    );
  }

  const root = await callNba(
    RUN_STUDENT_NBA_METHOD,
    {},
    {
      student_id: studentId,
      ...(request.forceRerunReason
        ? { force_rerun_reason: request.forceRerunReason }
        : {}),
    },
    {
      code: "NBA_EVALUATION_UNAVAILABLE",
      message: "Không thể kết nối tới dịch vụ đánh giá NBA.",
    },
  );
  const evaluation = text(root.evaluation);
  if (!evaluation) {
    throw new NbaApiError(
      502,
      "INVALID_NBA_EVALUATION_RESPONSE",
      "Phản hồi đánh giá NBA không hợp lệ.",
    );
  }

  const rawDisposition = text(root.disposition);
  const disposition =
    rawDisposition === "RECOMMEND" ||
    rawDisposition === "WAIT" ||
    rawDisposition === "NO_ACTION" ||
    rawDisposition === "ABSTAIN"
      ? rawDisposition
      : null;
  const recommendations = Array.isArray(root.recommendations)
    ? root.recommendations.flatMap((item) => {
        const normalized = normalizeRecommendation(item);
        return normalized ? [normalized] : [];
      })
    : [];

  return {
    evaluation,
    studentId: text(root.student_id) ?? studentId,
    status: text(root.status) ?? "unknown",
    disposition,
    recommendationCount: number(root.recommendation_count, 0),
    terminalReason: text(root.terminal_reason),
    recommendations,
  };
}

export async function decideNbaRecommendation(
  request: NbaDecisionRequest,
): Promise<NbaDecisionResponse> {
  const root = await callNba(
    DECIDE_RECOMMENDATION_METHOD,
    {},
    {
      name: request.name,
      expected_revision: request.expectedRevision,
      operation: request.operation,
      idempotency_key: request.idempotencyKey,
      ...(request.delta ? { delta: request.delta } : {}),
      ...(request.decisionReason
        ? { decision_reason: request.decisionReason }
        : {}),
      ...(request.revisitAt ? { revisit_at: request.revisitAt } : {}),
      ...(request.correlationId
        ? { correlation_id: request.correlationId }
        : {}),
    },
    {
      code: "NBA_DECISION_UNAVAILABLE",
      message: "Không thể ghi nhận quyết định NBA.",
    },
  );
  const status = root.status;
  if (
    status !== "accepted" &&
    status !== "rejected" &&
    status !== "deferred" &&
    status !== "dismissed"
  ) {
    throw new NbaApiError(
      502,
      "INVALID_NBA_DECISION_RESPONSE",
      "Phản hồi quyết định NBA không hợp lệ.",
    );
  }

  return {
    status,
    operation: request.operation,
    recommendation: text(root.recommendation) ?? request.name,
    action: text(root.action),
    event: text(root.event),
    receipt: text(root.receipt),
  };
}
