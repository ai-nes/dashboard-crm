import { displayValue } from "@/utils/display-value";
import type { AnalysisConfidence } from "@/services/api/analysis-runs";

export function displaySchoolValue(
  value: string | number | null | undefined,
): string | null {
  return displayValue(value);
}

export function schoolAnalysisTimestamp(value: string | null | undefined) {
  const timestamp = displaySchoolValue(value);
  return timestamp ? `Cập nhật lúc ${timestamp}` : undefined;
}

export function formatSchoolConfidence(value: AnalysisConfidence) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 0.85) return "Tin cậy cao";
    if (value >= 0.65) return "Tin cậy trung bình";
    return "Tin cậy thấp";
  }
  return typeof value === "string" ? value : null;
}

export function isPotentialScoreAvailable(
  dataAvailability: { fields: Record<string, string> } | undefined,
  score: number | null,
) {
  if (dataAvailability?.fields.potentialScore === "unavailable") return false;
  return typeof score === "number" && Number.isFinite(score);
}
