// Bảng màu data-viz ACC — tham chiếu token CSS (đã khai ở default.css/dark.css, theme-aware).
// Dùng trong style/Recharts props: fill/stroke nhận string nên trả về `var(--...)`.

export const ACC_SERIES_COUNT = 8;
export const ACC_SEQ_COUNT = 7;

/** Màu chuỗi phân loại thứ `i` (0-based, tự vòng lại sau 8). */
export function accSeries(i: number): string {
  return `var(--acc-series-${(((i % ACC_SERIES_COUNT) + ACC_SERIES_COUNT) % ACC_SERIES_COUNT) + 1})`;
}

/** Bậc màu tuần tự cho `value` trong khoảng [min, max] (1..7). */
export function accSeqStep(value: number, min: number, max: number): number {
  if (max <= min) return 1;
  const t = (value - min) / (max - min);
  return 1 + Math.min(ACC_SEQ_COUNT - 1, Math.max(0, Math.round(t * (ACC_SEQ_COUNT - 1))));
}

export function accSeq(step: number): string {
  return `var(--acc-seq-${Math.min(ACC_SEQ_COUNT, Math.max(1, step))})`;
}

/** Chữ đủ tương phản trên nền bậc tuần tự (bậc đậm → chữ trắng). */
export function accSeqInk(step: number): string {
  return step >= 4 ? "#ffffff" : "var(--text-primary)";
}

export type AccStatusTone = "good" | "warning" | "serious" | "critical" | "neutral";

export function accStatus(tone: AccStatusTone): string {
  switch (tone) {
    case "good":
      return "var(--acc-good)";
    case "warning":
      return "var(--acc-warning)";
    case "serious":
      return "var(--acc-serious)";
    case "critical":
      return "var(--acc-critical)";
    default:
      return "var(--text-tertiary)";
  }
}
