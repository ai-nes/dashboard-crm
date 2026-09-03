import type { TooltipContentProps } from "recharts";

interface ScoreDistributionTooltipProps extends Partial<TooltipContentProps<number, string>> {}

export default function ScoreDistributionTooltip({ active, payload }: ScoreDistributionTooltipProps) {
  const item = payload?.[0];
  const segment = item?.payload as { students?: number; share?: number } | undefined;

  if (!active || !item || !segment) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-text-primary">{item.name}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {(segment.students ?? 0).toLocaleString("vi-VN")} học sinh · {segment.share ?? 0}% tổng số
      </p>
    </div>
  );
}
