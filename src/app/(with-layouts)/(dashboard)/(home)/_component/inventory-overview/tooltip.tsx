import type { TooltipContentProps } from "recharts";

interface InventoryOverviewTooltipProps extends Partial<TooltipContentProps<number, string>> {
  availablePercent: number;
}

export default function InventoryOverviewTooltip({ active, availablePercent }: InventoryOverviewTooltipProps) {
  if (!active) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-text-primary">Tồn kho sẵn có</p>
      <p className="mt-1 text-xs text-text-secondary">{availablePercent.toLocaleString("vi-VN")}% mặt hàng hiện có thể đáp ứng.</p>
    </div>
  );
}
