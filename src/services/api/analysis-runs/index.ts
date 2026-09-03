import type {
  AnalysisClaim,
  AnalysisClaimKind,
  AnalysisRunKind,
  AnalysisReport,
  AnalysisReportItem,
  AnalysisRunRequest,
  AnalysisRunSnapshot,
  AnalysisRunStage,
  AnalysisRunStatus,
  AnalysisStageKind,
  AnalysisVisibilityLabel,
} from "./types";

export type * from "./types";

const STUDENT_REQUEST_METHOD =
  "crm.api.intelligence_runs.request_student_analysis_run";
const SCHOOL_REQUEST_METHOD =
  "crm.api.intelligence_runs.request_school_analysis_run";
const GET_RUN_METHOD = "crm.api.intelligence_runs.get_analysis_run";

type RequestOptions = { baseUrl?: string };

const RUN_STATUSES: AnalysisRunStatus[] = [
  "queued",
  "running",
  "completed",
  "abstained",
  "failed",
  "dead_lettered",
];

const STAGE_KINDS: AnalysisStageKind[] = [
  "student_360",
  "next_best_action",
  "school_360",
];
const CLAIM_KINDS: AnalysisClaimKind[] = [
  "fact",
  "inference",
  "uncertainty",
  "recommendation",
];
const VISIBILITY_LABELS: AnalysisVisibilityLabel[] = [
  "shareable",
  "source_scoped",
];

export class AnalysisRunApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AnalysisRunApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getErrorDetails(payload: unknown): {
  code?: string;
  message?: string;
} {
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);

  return {
    code:
      text(error?.code) ??
      text(root?.exception) ??
      text(message?.exception) ??
      undefined,
    message:
      text(error?.message) ??
      text(message?.message) ??
      text(root?.message) ??
      text(root?.exception) ??
      undefined,
  };
}

function resolveBaseUrl(options: RequestOptions): string {
  const baseUrl = (
    options.baseUrl ??
    process.env.NEXT_PUBLIC_FRAPPE_URL ??
    ""
  ).replace(/\/+$/, "");
  if (!baseUrl) {
    throw new AnalysisRunApiError(
      0,
      "FRAPPE_URL_MISSING",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }
  return baseUrl;
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: RequestOptions,
  contentType = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (contentType) headers["Content-Type"] = "application/json";

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Contract tests can call this service outside a Next request context.
    }
  }

  // Frappe protects authenticated write methods with a session-bound CSRF
  // token. The login response does not always expose it as a browser cookie,
  // so obtain it from the already-authenticated session endpoint before a
  // client-side POST. This keeps credentials on the Frappe origin and avoids
  // weakening CSRF checks server-side.
  if (typeof window !== "undefined" && contentType) {
    const cookieToken = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (cookieToken) {
      headers["X-Frappe-CSRF-Token"] = decodeURIComponent(cookieToken);
    } else {
      try {
        const sessionResponse = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const sessionPayload = (await sessionResponse.json().catch(() => null)) as
          | { message?: { csrf_token?: unknown } }
          | null;
        const csrfToken = sessionPayload?.message?.csrf_token;
        if (typeof csrfToken === "string" && csrfToken) {
          headers["X-Frappe-CSRF-Token"] = csrfToken;
        }
      } catch {
        // The write request will return the authoritative authentication/CSRF
        // error if the session token cannot be read.
      }
    }
  }

  return headers;
}

async function parseResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function throwResponseError(response: Response, payload: unknown): never {
  const details = getErrorDetails(payload);
  throw new AnalysisRunApiError(
    response.status,
    details.code ?? "ANALYSIS_RUN_UNAVAILABLE",
    details.message ?? `Lỗi HTTP ${response.status}: ${response.statusText}`,
  );
}

function unwrap(value: unknown): Record<string, unknown> {
  const root = asRecord(value) ?? {};
  const message = asRecord(root.message);
  return message ?? root;
}

function normalizeStatus(value: unknown): AnalysisRunStatus {
  const status = text(value);
  return status && RUN_STATUSES.includes(status as AnalysisRunStatus)
    ? (status as AnalysisRunStatus)
    : "queued";
}

function normalizeRunKind(
  value: unknown,
  fallback: AnalysisRunKind,
): AnalysisRunKind {
  const kind = text(value)?.toLowerCase();
  if (kind === "student" || kind?.includes("student")) return "student";
  if (
    kind === "school" ||
    kind?.includes("school") ||
    kind?.includes("high school")
  )
    return "school";
  return fallback;
}

function normalizeStageKind(
  value: unknown,
  fallback: AnalysisStageKind,
): AnalysisStageKind {
  const stageKind = text(value);
  return stageKind && STAGE_KINDS.includes(stageKind as AnalysisStageKind)
    ? (stageKind as AnalysisStageKind)
    : fallback;
}

function parseClaims(value: unknown): AnalysisClaim[] {
  let claimsValue = value;
  if (typeof claimsValue === "string") {
    try {
      claimsValue = JSON.parse(claimsValue);
    } catch {
      claimsValue = [];
    }
  }
  if (!Array.isArray(claimsValue)) return [];

  return claimsValue.flatMap((item): AnalysisClaim[] => {
    const claim = asRecord(item);
    // Frappe's visible_claims response uses the compact wire names
    // (kind/text/visibility); accept the dashboard's camelCase and the
    // agent's snake_case aliases as well so a valid completed run is not
    // rendered as an empty result set.
    const statement = text(claim?.statement ?? claim?.text);
    const claimKind = text(
      claim?.claimKind ?? claim?.claim_kind ?? claim?.kind,
    );
    if (
      !claim ||
      !statement ||
      !claimKind ||
      !CLAIM_KINDS.includes(claimKind as AnalysisClaimKind)
    ) {
      return [];
    }

    const rawProvenance = claim.provenanceIds ?? claim.provenance_ids;
    const provenanceIds = Array.isArray(rawProvenance)
      ? rawProvenance.filter(
          (source): source is string =>
            typeof source === "string" && Boolean(source.trim()),
        )
      : [];
    const visibilityLabel = text(
      claim.visibilityLabel ?? claim.visibility_label ?? claim.visibility,
    );

    return [
      {
        claimKind: claimKind as AnalysisClaimKind,
        statement,
        provenanceIds,
        visibilityLabel:
          visibilityLabel &&
          VISIBILITY_LABELS.includes(visibilityLabel as AnalysisVisibilityLabel)
            ? (visibilityLabel as AnalysisVisibilityLabel)
            : "source_scoped",
        confidence: numberValue(claim.confidence),
      },
    ];
  });
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseProvenance(value: unknown): string[] {
  const parsed = parseJson(value);
  return Array.isArray(parsed)
    ? parsed.filter(
        (source): source is string =>
          typeof source === "string" && Boolean(source.trim()),
      )
    : [];
}

function parseTextList(value: unknown): string[] {
  let list = value;
  if (typeof list === "string") list = parseJson(list);
  if (!Array.isArray(list)) return [];

  return list.flatMap((item) => {
    const value = text(item);
    return value ? [value] : [];
  });
}

function parseReportItems(
  value: unknown,
  defaultKind: AnalysisReportItem["kind"],
): AnalysisReportItem[] {
  const parsed = parseJson(value);
  const items = Array.isArray(parsed) ? parsed : [];
  return items.flatMap((value): AnalysisReportItem[] => {
    const item = asRecord(value);
    if (!item)
      return typeof value === "string" && value.trim()
        ? [
            {
              kind: defaultKind,
              headline: value.trim(),
              detail: value.trim(),
              confidence: null,
              provenanceIds: [],
            },
          ]
        : [];

    const headline = text(
      item.headline ?? item.title ?? item.label ?? item.action,
    );
    const detail = text(
      item.detail ??
        item.rationale ??
        item.why ??
        item.description ??
        item.statement ??
        item.next_step ??
        item.text,
    );
    if (!headline && !detail) return [];
    const rawKind = text(item.kind)?.toLowerCase();
    const kind: AnalysisReportItem["kind"] =
      rawKind === "risk" || rawKind === "recommendation" || rawKind === "opportunity"
        ? rawKind
        : defaultKind;
    return [
      {
        kind,
        headline: headline ?? detail ?? "",
        detail: detail ?? headline ?? "",
        confidence: numberValue(item.confidence),
        provenanceIds: parseProvenance(
          item.provenanceIds ?? item.provenance_ids,
        ),
      },
    ];
  });
}

function parseReport(value: unknown): AnalysisReport | null {
  const report = asRecord(parseJson(value));
  if (!report) return null;
  // Preserve response order. The UI groups items by kind without dropping or
  // reordering any item from the report.
  const recommendations = [
    ...parseReportItems(report.recommendations, "recommendation"),
    ...parseReportItems(
      report.recommendedActions ?? report.recommended_actions,
      "recommendation",
    ),
    ...parseReportItems(report.opportunities, "opportunity"),
  ];
  const missingEvidence = parseTextList(
    report.missingEvidence ??
      report.missing_evidence ??
      report.evidenceGaps ??
      report.evidence_gaps,
  );
  const normalized: AnalysisReport = {
    title: text(report.title ?? report.short_title ?? report.headline),
    summary: text(
      report.summary ?? report.executiveSummary ?? report.executive_summary,
    ),
    risks: parseReportItems(report.risks, "risk"),
    recommendations,
    missingEvidence,
  };
  return normalized.summary ||
    normalized.risks.length > 0 ||
    normalized.recommendations.length > 0 ||
    missingEvidence.length > 0
    ? normalized
    : null;
}

function normalizeStage(
  value: unknown,
  fallback: AnalysisStageKind,
): AnalysisRunStage {
  const stage = asRecord(value) ?? {};
  return {
    id: text(stage.id ?? stage.name) ?? undefined,
    stageKind: normalizeStageKind(
      stage.stageKind ?? stage.stage_kind,
      fallback,
    ),
    status: normalizeStatus(stage.status),
    claims: parseClaims(
      stage.claims ?? stage.visibleClaims ?? stage.visible_claims,
    ),
    report: parseReport(
      stage.report ?? stage.report_json ?? stage.analysis_report,
    ),
    terminalReason: text(stage.terminalReason ?? stage.terminal_reason),
    policyRevision: text(stage.policyRevision ?? stage.policy_revision),
    modelRevision: text(stage.modelRevision ?? stage.model_revision),
  };
}

function normalizeStages(
  value: unknown,
  kind: AnalysisRunKind,
): AnalysisRunStage[] {
  if (!Array.isArray(value)) return [];
  const fallbacks: AnalysisStageKind[] =
    kind === "student" ? ["student_360", "next_best_action"] : ["school_360"];
  return value.map((stage, index) =>
    normalizeStage(stage, fallbacks[index] ?? fallbacks[0]),
  );
}

export function normalizeAnalysisRun(
  value: unknown,
  fallbackKind: AnalysisRunKind,
): AnalysisRunSnapshot {
  const root = unwrap(value);
  const runKind = normalizeRunKind(
    root.runKind ?? root.run_kind ?? root.runType ?? root.run_type,
    fallbackKind,
  );
  return {
    runId: text(root.runId ?? root.run_id) ?? "",
    runKind,
    receiptId:
      text(root.receiptId ?? root.receipt_id ?? root.receipt) ?? undefined,
    status: normalizeStatus(root.status),
    stages: normalizeStages(root.stages, runKind),
    sourceRevision: numberValue(root.sourceRevision ?? root.source_revision),
    sourceDigest: text(root.sourceDigest ?? root.source_digest),
    expiresAt: text(root.expiresAt ?? root.expires_at),
    reusedExistingRun:
      root.reusedExistingRun === true || root.reused_existing_run === true,
  };
}

function createIdempotencyKey(kind: AnalysisRunKind, targetId: string): string {
  const target = targetId
    .trim()
    .replace(/[^A-Za-z0-9._:-]+/g, "-")
    .slice(0, 96);
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `dashboard-${kind}-${target}-${random}`;
}

export async function requestAnalysisRun(
  request: AnalysisRunRequest,
  options: RequestOptions = {},
): Promise<AnalysisRunSnapshot> {
  const baseUrl = resolveBaseUrl(options);
  const method =
    request.kind === "student" ? STUDENT_REQUEST_METHOD : SCHOOL_REQUEST_METHOD;
  const payload =
    request.kind === "student"
      ? { student: request.studentId.trim() }
      : {
          high_school: request.highSchool.trim(),
          ...(request.admissionYear !== undefined
            ? { admission_year: request.admissionYear }
            : {}),
        };
  const headers = await requestHeaders(options, true);
  headers["Idempotency-Key"] = createIdempotencyKey(
    request.kind,
    request.kind === "student" ? request.studentId : request.highSchool,
  );

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/method/${method}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new AnalysisRunApiError(
      503,
      "ANALYSIS_RUN_UNAVAILABLE",
      "Không thể kết nối tới dịch vụ phân tích.",
    );
  }

  const result = await parseResponse(response);
  const normalized = normalizeAnalysisRun(result, request.kind);
  // Frappe may settle one 360 stage while the downstream NBA stage abstains;
  // older gateway responses surfaced that partial run with HTTP 400. Preserve
  // the completed, report-bearing stage so the dashboard can still render the
  // useful analysis instead of replacing it with a generic error state.
  if (!response.ok) {
    const hasCompletedStage = normalized.stages.some(
      (stage) => stage.status === "completed",
    );
    if (normalized.runId && hasCompletedStage) return normalized;
    throwResponseError(response, result);
  }

  if (!normalized.runId || !normalized.stages.length) {
    throw new AnalysisRunApiError(
      502,
      "INVALID_ANALYSIS_RUN_RESPONSE",
      "Phản hồi tạo yêu cầu phân tích không hợp lệ.",
    );
  }
  return normalized;
}

export async function getAnalysisRun(
  runId: string,
  runKind: AnalysisRunKind,
  options: RequestOptions = {},
): Promise<AnalysisRunSnapshot> {
  const baseUrl = resolveBaseUrl(options);
  const query = new URLSearchParams({
    run_type:
      runKind === "student"
        ? "CRM Student Analysis Run"
        : "CRM School Analysis Run",
    run_id: runId,
  });
  const headers = await requestHeaders(options);

  let response: Response;
  try {
    response = await fetch(
      `${baseUrl}/api/method/${GET_RUN_METHOD}?${query.toString()}`,
      {
        headers,
        ...(typeof window !== "undefined"
          ? { credentials: "include" as RequestCredentials }
          : {}),
        cache: "no-store",
      },
    );
  } catch {
    throw new AnalysisRunApiError(
      503,
      "ANALYSIS_RUN_UNAVAILABLE",
      "Không thể tải trạng thái phân tích.",
    );
  }

  const result = await parseResponse(response);
  if (!response.ok) throwResponseError(response, result);

  const normalized = normalizeAnalysisRun(result, runKind);
  if (!normalized.runId || !normalized.stages.length) {
    throw new AnalysisRunApiError(
      502,
      "INVALID_ANALYSIS_RUN_RESPONSE",
      "Phản hồi trạng thái phân tích không hợp lệ.",
    );
  }
  return normalized;
}
