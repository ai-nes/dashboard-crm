const DEFAULT_SEGMENT_TITLE = "Segment chưa đặt tên";

export function createDefaultSegmentName(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${DEFAULT_SEGMENT_TITLE} · ${values.day}/${values.month}/${values.year} ${values.hour}:${values.minute}:${values.second}`;
}
