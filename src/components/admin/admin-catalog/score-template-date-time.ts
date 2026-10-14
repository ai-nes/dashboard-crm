const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function formatScoreModifiedAt(value?: string): string {
  if (!value) return "Chưa thiết lập";

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Chưa thiết lập";

  const parts = new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value: part }) => [type, part]),
  );

  return `${values.day}/${values.month}/${values.year} · ${values.hour}:${values.minute}`;
}
