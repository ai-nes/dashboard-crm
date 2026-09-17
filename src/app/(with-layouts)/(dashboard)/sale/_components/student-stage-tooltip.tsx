interface StudentStageTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      label?: string;
      count?: number;
      share?: number;
    };
  }>;
}

export default function StudentStageTooltip({ active, payload }: StudentStageTooltipProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  const count = new Intl.NumberFormat("vi-VN").format(item.count ?? 0);
  const share = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(item.share ?? 0);

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-2.5 text-xs shadow-md">
      <p className="font-semibold text-text-primary">{item.label}</p>
      <p className="mt-1 text-text-secondary">{count} học sinh · {share}%</p>
    </div>
  );
}
