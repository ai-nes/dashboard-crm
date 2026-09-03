export function displaySchoolValue(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString("vi-VN") : null;
  }

  const normalized = value.trim();
  if (
    !normalized ||
    normalized === "-" ||
    normalized === "Chưa có dữ liệu" ||
    normalized.toLowerCase() === "null"
  ) {
    return null;
  }
  return normalized;
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
