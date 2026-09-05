const SENTINEL_VALUES = new Set(["none", "null", "n/a", "undefined", "-", "chưa có dữ liệu"]);

/**
 * Some backend responses serialize missing fields as the literal string
 * "None"/"null" instead of JSON null. Treat those the same as missing.
 */
export function displayValue(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString("vi-VN") : null;
  }

  const normalized = value.trim();
  if (!normalized || SENTINEL_VALUES.has(normalized.toLowerCase())) return null;
  return normalized;
}

export function cleanTextList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => (typeof item === "string" ? item.trim() : null))
    .filter((item): item is string => Boolean(item) && !SENTINEL_VALUES.has((item ?? "").toLowerCase()));
}
