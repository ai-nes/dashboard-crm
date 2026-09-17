export function formatReportDate(date: string, timezone: string): string {
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timezone,
  }).format(value);
}

export function formatDueTime(value: string | null, timezone: string): string {
  if (!value) return "Chưa đặt hạn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export function formatTaskDeadline(
  value: string | null,
  timezone: string,
  referenceDate: string,
): string {
  if (!value) return "Chưa đặt hạn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const dueDateKey = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(date);
  const dateLabel = dueDateKey === referenceDate
    ? "Hôm nay"
    : new Intl.DateTimeFormat("vi-VN", {
        day: "numeric",
        month: "short",
        timeZone: timezone,
      }).format(date);
  const timeLabel = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);

  return `${dateLabel} · ${timeLabel}`;
}
