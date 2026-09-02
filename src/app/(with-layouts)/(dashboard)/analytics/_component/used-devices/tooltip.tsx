import type { TooltipContentProps } from "recharts";

interface UsedDevicesTooltipProps extends Partial<TooltipContentProps<number, string>> {}

export default function UsedDevicesTooltip({ active, payload }: UsedDevicesTooltipProps) {
  const item = payload?.[0];
  const percentage = typeof item?.value === "number" ? item.value : 0;

  if (!active || !item) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-text-primary">{item.name}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {percentage.toFixed(1)}% tổng số phiên trong khoảng thời gian đang xem
      </p>
    </div>
  );
}
