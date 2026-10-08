import type {
  AnalysisReport,
  AnalysisReportItem,
  AnalysisRunSnapshot,
  AnalysisRunStatus,
} from "../analysis-runs/types";
import type {
  AiDimension,
  StudentAiLabels,
  StudentAiOverview,
  StudentAnalysis,
} from "./types";

/** Dimensions where a high or medium level is trouble rather than good news. */
const TROUBLE_DIMENSIONS = new Set(["barrier"]);

function dimensionName(code: string, labels: StudentAiLabels): string {
  return labels.dimensions[code]?.label ?? code;
}

function levelName(dimension: AiDimension, labels: StudentAiLabels): string {
  return labels.dimensions[dimension.code]?.levels[dimension.level] ?? dimension.level;
}

const refIds = (refs: Array<{ type: string; id: string }> | undefined) =>
  (refs ?? []).map((ref) => `${ref.type}:${ref.id}`);

function troubleOf(
  dimension: AiDimension,
  labels: StudentAiLabels,
): AnalysisReportItem | null {
  const isTrouble =
    TROUBLE_DIMENSIONS.has(dimension.code)
      ? dimension.level === "high" || dimension.level === "medium"
      : dimension.code === "family" && dimension.level === "low";
  if (!isTrouble) return null;
  return {
    kind: "risk",
    code: dimension.code,
    signalType: dimension.code,
    severity: dimension.level,
    headline: levelName(dimension, labels),
    detail: dimension.summary ?? "",
    confidence: null,
    provenanceIds: refIds(dimension.evidence?.map((entry) => entry.ref)),
  };
}

/** The legacy 360 cards read this report shape; fill it from the crm-ai analysis. */
export function toAnalysisReport(
  analysis: StudentAnalysis,
  labels: StudentAiLabels,
): AnalysisReport {
  const { insight_card: card, dimensions, positives } = analysis.insight;
  const missing = dimensions.flatMap((dimension) =>
    (dimension.missing ?? []).map(
      (item) => `${dimensionName(dimension.code, labels)}: ${item}`,
    ),
  );
  return {
    title: card.headline ?? null,
    summary: card.headline ?? null,
    risks: dimensions
      .map((dimension) => troubleOf(dimension, labels))
      .filter((item): item is AnalysisReportItem => item !== null),
    recommendations: analysis.nba.items.map((item) => ({
      kind: "recommendation" as const,
      code: item.action_code,
      headline: item.title,
      detail: [item.why, item.goal, item.time && `Thời điểm: ${item.time}`]
        .filter(Boolean)
        .join(" "),
      confidence: null,
      provenanceIds: refIds(item.refs),
    })),
    opportunities: positives.map((positive) => ({
      kind: "opportunity" as const,
      headline: positive.text,
      detail: "",
      confidence: null,
      provenanceIds: refIds(positive.refs),
    })),
    advisorySignals: dimensions.map((dimension) => ({
      type: dimension.code,
      title: `${dimensionName(dimension.code, labels)}: ${levelName(dimension, labels)}`,
      summary: dimension.summary ?? "",
      confidence: null,
      evidenceRefs: refIds(dimension.evidence?.map((entry) => entry.ref)),
    })),
    recentChanges: (card.points ?? []).map((point) => ({
      type: "insight_point",
      summary: point,
      evidenceRefs: [],
    })),
    missingEvidence: missing,
  };
}

const STATUS: Record<StudentAiOverview["state"], AnalysisRunStatus | null> = {
  idle: null,
  queued: "queued",
  running: "running",
  failed: "failed",
};

/**
 * Presents the stored analysis as the run the existing 360 cards expect: one
 * `student_360` stage, `running` while crm-ai works and `completed` otherwise.
 */
export function toAnalysisRun(
  overview: StudentAiOverview,
): AnalysisRunSnapshot | null {
  const { analysis, state } = overview;
  if (!analysis && state === "idle") return null;
  const status: AnalysisRunStatus = STATUS[state] ?? "completed";
  return {
    runId: analysis?.nba.run_id || `student-ai-${overview.student_id}`,
    runKind: "student",
    status,
    terminalReason: state === "failed" ? "analysis_failed" : null,
    stages: [
      {
        stageKind: "student_360",
        status,
        claims: [],
        report: analysis ? toAnalysisReport(analysis, overview.labels) : null,
        terminalReason: state === "failed" ? "analysis_failed" : null,
        policyRevision: null,
        modelRevision: null,
      },
    ],
    sourceRevision: analysis?.source_revision ?? null,
  };
}
