import { formatStudentAuditChangeValue } from "./student-audit-changes";

const MAX_SUMMARY_LENGTH = 160;

export function summarizeStudentAuditValue(
  field: string,
  value: unknown,
): string {
  let summary: string;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const card = record.insight_card as Record<string, unknown> | undefined;
    if (card && typeof card.headline === "string") {
      summary = card.headline;
    } else if (typeof record.total === "number") {
      summary = [
        `Tổng: ${record.total}`,
        typeof record.completed === "number"
          ? `Hoàn tất: ${record.completed}`
          : null,
        typeof record.verified === "number"
          ? `Đã xác minh: ${record.verified}`
          : null,
        Array.isArray(record.missing)
          ? `Còn thiếu: ${record.missing.length}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
    } else {
      summary = `${Object.keys(record).length} mục thông tin`;
    }
  } else if (Array.isArray(value)) {
    summary = `${value.length} mục thông tin`;
  } else {
    summary = formatStudentAuditChangeValue(field, value);
  }
  return summary.length > MAX_SUMMARY_LENGTH
    ? `${summary.slice(0, MAX_SUMMARY_LENGTH).trimEnd()}…`
    : summary;
}

export function needsStudentAuditDetails(value: unknown): boolean {
  return (
    (value !== null && typeof value === "object") ||
    (typeof value === "string" && value.length > MAX_SUMMARY_LENGTH)
  );
}
