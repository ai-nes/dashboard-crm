import type {
  AiDimension,
  AiDimensionEvidence,
  StudentAiLabels,
} from "@/services/api/student-ai";
import {
  getDimensionLabel,
  getDimensionLevelLabel,
  STUDENT_DIMENSIONS,
} from "./student-analysis-display";

export type AnalysisDimensionCode = (typeof STUDENT_DIMENSIONS)[number]["code"];
export interface AnalysisDimensionView {
  code: AnalysisDimensionCode;
  label: string;
  chartLabel: string;
  score: number | null;
  assessment: string;
  dimension?: AiDimension;
  evidence: AiDimensionEvidence[];
  missing: string[];
  evidenceQuality: "clear" | "partial" | "insufficient";
}
export function buildAnalysisDimensions(
  dimensions?: AiDimension[],
  labels?: StudentAiLabels,
): AnalysisDimensionView[] {
  return STUDENT_DIMENSIONS.map((definition) => {
    const dimension = dimensions?.find((d) => d.code === definition.code);
    const level = dimension?.level;
    const base =
      level === "high"
        ? 100
        : level === "medium"
          ? 50
          : level === "low"
            ? 0
            : null;
    const projected = dimension?.readiness_score;
    const score =
      base === null
        ? null
        : dimension?.score_basis === "level" &&
            typeof projected === "number" &&
            [0, 50, 100].includes(projected)
          ? projected
          : definition.code === "barrier"
            ? 100 - base
            : base;
    const evidence =
      dimension?.evidence?.filter(
        (e) => e.ref?.type?.trim() && e.ref?.id?.trim(),
      ) ?? [];
    const missing =
      dimension?.missing?.map((s) => s.trim()).filter(Boolean) ?? [];
    return {
      code: definition.code,
      label:
        definition.code === "barrier"
          ? "Giải quyết rào cản"
          : getDimensionLabel(definition.code, labels),
      chartLabel:
        definition.code === "barrier"
          ? "Vượt rào cản"
          : getDimensionLabel(definition.code, labels),
      // Derive the same documented ordinal scale for old responses during rollout.
      score,
      assessment: dimension
        ? getDimensionLevelLabel(dimension, labels)
        : "Chưa xác định",
      dimension,
      evidence,
      missing,
      evidenceQuality:
        score === null || !evidence.length
          ? "insufficient"
          : missing.length
            ? "partial"
            : "clear",
    };
  });
}
export function getInitialAnalysisDimension(
  items: AnalysisDimensionView[],
): AnalysisDimensionCode {
  if (
    items.some((d) => d.code === "barrier" && d.score !== null && d.score < 100)
  )
    return "barrier";
  return (
    [...items]
      .filter((d) => d.score !== null)
      .sort((a, b) => a.score! - b.score!)[0]?.code ?? "interest"
  );
}
export interface AnalysisRadarPoint {
  x: number;
  y: number;
  cx?: number;
  cy?: number;
  value?: number | null;
  payload?: { code?: string };
}
export function radarSegments(points: AnalysisRadarPoint[]): string[] {
  if (points.length < 2) return [];
  const lines: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (
      typeof a.value === "number" &&
      Number.isFinite(a.value) &&
      typeof b.value === "number" &&
      Number.isFinite(b.value)
    )
      lines.push(`M${a.x},${a.y}L${b.x},${b.y}`);
  }
  return lines;
}
