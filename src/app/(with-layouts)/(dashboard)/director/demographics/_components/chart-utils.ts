export function getCountAxisMax(values: Array<number | null | undefined>): number {
  const maxValue = Math.max(...values.filter((value): value is number => typeof value === "number" && Number.isFinite(value)), 0);
  if (maxValue <= 0) return 1;

  const step = maxValue >= 1000 ? 500 : maxValue >= 100 ? 50 : maxValue >= 10 ? 10 : 1;
  return Math.ceil(maxValue / step) * step;
}

export function formatCountTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}k`;
  return value.toLocaleString("vi-VN");
}

export function formatGrowth(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

export function formatRate(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

export function safeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0 || numerator < 0) return null;
  return (numerator / denominator) * 100;
}
