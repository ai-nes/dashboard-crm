interface ActivityChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
}

const formatNumber = (value: number) => value.toLocaleString("vi-VN");

export default function ActivityChartTooltip({ active, label, payload }: ActivityChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="mb-2 font-semibold text-text-primary">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <p key={item.name} className="flex items-center justify-between gap-5 text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
              {item.name}
            </span>
            <strong className="text-text-primary">{typeof item.value === "number" ? formatNumber(item.value) : "—"}</strong>
          </p>
        ))}
      </div>
    </div>
  );
}
