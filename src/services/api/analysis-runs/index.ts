import { NestApiError, nestRequest } from "../nest/nest-client";
import type {
  AnalysisAdvisorySignal,
  AnalysisClaim,
  AnalysisClaimKind,
  AnalysisConfidence,
  AnalysisRecentChange,
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
import type { Coverage, EvidenceRef, FindingRef } from "../intelligence-refs";

export type * from "./types";
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

function unwrap(value: unknown): Record<string, unknown> {
  const root = asRecord(value) ?? {};
  const message = asRecord(root.message);
  return message ?? root;
}

function normalizeStatus(value: unknown): AnalysisRunStatus {
  const status = text(value)?.toLowerCase();
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
    // The compact wire names
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
        confidence: parseConfidence(claim.confidence),
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

function parseReferenceList<
  T extends { contract_version: "intelligence-reference-v1" },
>(value: unknown): T[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (item): item is T =>
      asRecord(item)?.contract_version === "intelligence-reference-v1",
  );
}

function parseConfidence(value: unknown): AnalysisConfidence {
  const numeric = numberValue(value);
  if (numeric !== null) return numeric;
  return text(value)?.toUpperCase() ?? null;
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
        item.summary ??
        item.text,
    );
    if (!headline && !detail) return [];
    const rawKind = text(item.kind)?.toLowerCase();
    const kind: AnalysisReportItem["kind"] =
      rawKind === "risk" ||
      rawKind === "recommendation" ||
      rawKind === "opportunity"
        ? rawKind
        : defaultKind;
    return [
      {
        kind,
        code: text(item.code),
        signalType: text(item.type),
        severity: text(item.severity),
        strength: text(item.strength),
        headline: headline ?? detail ?? "",
        detail: detail ?? headline ?? "",
        confidence: parseConfidence(item.confidence),
        provenanceIds: parseProvenance(
          item.provenanceIds ?? item.provenance_ids ?? item.evidence_refs,
        ),
      },
    ];
  });
}

function parseAdvisorySignals(value: unknown): AnalysisAdvisorySignal[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((value): AnalysisAdvisorySignal[] => {
    const item = asRecord(value);
    if (!item) return [];
    const type = text(item.type);
    const title = text(item.title ?? item.headline);
    const summary = text(item.summary ?? item.detail ?? item.description);
    if (!type || !title || !summary) return [];
    return [
      {
        type,
        title,
        summary,
        confidence: parseConfidence(item.confidence),
        evidenceRefs: parseProvenance(
          item.evidence_refs ?? item.evidenceRefs ?? item.provenance_ids,
        ),
      },
    ];
  });
}

function parseRecentChanges(value: unknown): AnalysisRecentChange[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((value): AnalysisRecentChange[] => {
    const item = asRecord(value);
    if (!item) return [];
    const type = text(item.type);
    const summary = text(item.summary ?? item.detail ?? item.description);
    if (!type || !summary) return [];
    return [
      {
        type,
        summary,
        evidenceRefs: parseProvenance(
          item.evidence_refs ?? item.evidenceRefs ?? item.provenance_ids,
        ),
      },
    ];
  });
}

function parseReport(value: unknown): AnalysisReport | null {
  const report = asRecord(parseJson(value));
  if (!report) return null;
  // Keep the legacy combined list for existing cards, while exposing the new
  // response groups explicitly to the richer report UI.
  const legacyRecommendations = [
    ...parseReportItems(report.recommendations, "recommendation"),
    ...parseReportItems(
      report.recommendedActions ?? report.recommended_actions,
      "recommendation",
    ),
  ];
  const opportunities = [
    ...parseReportItems(report.opportunities, "opportunity"),
    ...parseReportItems(
      report.opportunitySignals ?? report.opportunity_signals,
      "opportunity",
    ),
  ];
  const advisorySignals = parseAdvisorySignals(
    report.advisorySignals ?? report.advisory_signals,
  );
  const recentChanges = parseRecentChanges(
    report.recentChanges ?? report.recent_changes,
  );
  const recommendations = [...legacyRecommendations, ...opportunities];
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
    advisorySignals,
    opportunities,
    recentChanges,
    missingEvidence,
    intelligenceRefs: parseReferenceList<EvidenceRef>(
      report.intelligence_refs ?? report.intelligenceRefs,
    ),
    findingRefs: parseReferenceList<FindingRef>(
      report.finding_refs ?? report.findingRefs,
    ),
    coverage: parseReferenceList<Coverage>(report.coverage),
  };
  return normalized.summary ||
    normalized.risks.length > 0 ||
    normalized.recommendations.length > 0 ||
    advisorySignals.length > 0 ||
    recentChanges.length > 0 ||
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
  const fallbacks: AnalysisStageKind[] =
    kind === "student" ? ["student_360", "next_best_action"] : ["school_360"];
  if (Array.isArray(value)) {
    return value.map((stage, index) =>
      normalizeStage(stage, fallbacks[index] ?? fallbacks[0]),
    );
  }

  return [];
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
    terminalReason: text(root.terminalReason ?? root.terminal_reason),
    stages: normalizeStages(root.stages, runKind),
    sourceRevision: numberValue(root.sourceRevision ?? root.source_revision),
    sourceDigest: text(root.sourceDigest ?? root.source_digest),
    expiresAt: text(root.expiresAt ?? root.expires_at),
    reusedExistingRun:
      root.reusedExistingRun === true || root.reused_existing_run === true,
  };
}

function toRunError(error: unknown): unknown {
  if (error instanceof NestApiError) {
    return new AnalysisRunApiError(error.status, error.code, error.message);
  }
  return error;
}

/** Starts (or reuses) the AI analysis run of one school. */
export async function requestAnalysisRun(
  request: AnalysisRunRequest,
): Promise<AnalysisRunSnapshot> {
  const schoolId = request.highSchool.trim();
  if (!schoolId) {
    throw new AnalysisRunApiError(
      400,
      "INVALID_SCHOOL",
      "Thiếu mã trường cần phân tích.",
    );
  }

  let result: unknown;
  try {
    result = await nestRequest<unknown>(
      `/api/v1/director/schools/${encodeURIComponent(schoolId)}/ai-analysis`,
      {
        method: "POST",
        body:
          request.admissionYear !== undefined
            ? { admissionYear: request.admissionYear }
            : {},
      },
    );
  } catch (error) {
    throw toRunError(error);
  }

  const normalized = normalizeAnalysisRun(result, "school");
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
): Promise<AnalysisRunSnapshot> {
  let result: unknown;
  try {
    result = await nestRequest<unknown>(
      `/api/v1/ai/analysis-runs/${encodeURIComponent(runId)}`,
    );
  } catch (error) {
    throw toRunError(error);
  }

  const normalized = normalizeAnalysisRun(result, "school");
  if (!normalized.runId || !normalized.stages.length) {
    throw new AnalysisRunApiError(
      502,
      "INVALID_ANALYSIS_RUN_RESPONSE",
      "Phản hồi trạng thái phân tích không hợp lệ.",
    );
  }
  return normalized;
}
