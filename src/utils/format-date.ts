/**
 * Định dạng chuỗi ngày giờ (ISO 8601, timestamp, Date) sang chuẩn tiếng Việt:
 * - formatDateTime: "HH:mm · DD/MM/YYYY" (hoặc "DD/MM/YYYY" nếu chỉ có ngày)
 * - formatDate: "DD/MM/YYYY"
 */
export function formatDateTime(
  dateInput?: string | number | Date | null,
  fallback = "-"
): string {
  if (!dateInput) return fallback;

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return fallback;
    if (
      trimmed.includes("trước") ||
      trimmed.includes("Hôm nay") ||
      trimmed.includes("Hôm qua") ||
      trimmed.includes("vài giây")
    ) {
      return trimmed;
    }
  }

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return typeof dateInput === "string" ? dateInput : fallback;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      return `${day}/${month}/${year}`;
    }

    return `${hours}:${minutes} · ${day}/${month}/${year}`;
  } catch {
    return typeof dateInput === "string" ? dateInput : fallback;
  }
}

export function formatDate(
  dateInput?: string | number | Date | null,
  fallback = "-"
): string {
  if (!dateInput) return fallback;

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return fallback;
    if (
      trimmed.includes("trước") ||
      trimmed.includes("Hôm nay") ||
      trimmed.includes("Hôm qua")
    ) {
      return trimmed;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }
  }

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return typeof dateInput === "string" ? dateInput : fallback;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return typeof dateInput === "string" ? dateInput : fallback;
  }
}
