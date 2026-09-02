import type { TooltipContentProps } from "recharts";

interface AnalysisSignalProfileTooltipProps extends Partial<TooltipContentProps<number, string>> {
  totalClaims: number;
}

export default function AnalysisSignalProfileTooltip({ active, payload, totalClaims }: AnalysisSignalProfileTooltipProps) {
  const item = payload?.[0];
  const value = typeof item?.value === "number" ? item.value : 0;

  if (!active || !item) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-text-primary">{item.name}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {value.toLocaleString("vi-VN")} tín hiệu · {totalClaims > 0 ? ((value / totalClaims) * 100).toFixed(1) : 0}% tổng số
      </p>
    </div>
  );
}
