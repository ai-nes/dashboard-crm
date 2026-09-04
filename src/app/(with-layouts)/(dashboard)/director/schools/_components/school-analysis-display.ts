import { displayValue } from "@/utils/display-value";

export function displaySchoolValue(
  value: string | number | null | undefined,
): string | null {
  return displayValue(value);
}

export function schoolAnalysisTimestamp(value: string | null | undefined) {
  const timestamp = displaySchoolValue(value);
  return timestamp ? `Cập nhật lúc ${timestamp}` : undefined;
}

export function formatSchoolConfidence(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return `Độ tin cậy ${Math.round(value * 100)}%`;
}

export function isPotentialScoreAvailable(
  dataAvailability: { fields: Record<string, string> } | undefined,
  score: number,
) {
  if (dataAvailability?.fields.potentialScore === "unavailable") return false;
  return Number.isFinite(score);
}
