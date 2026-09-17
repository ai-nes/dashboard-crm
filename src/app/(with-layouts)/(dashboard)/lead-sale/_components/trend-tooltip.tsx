interface TrendTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | null; color?: string }>;
  label?: string;
}

export default function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-44 rounded-xl border border-card-border bg-dropdowns-background p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-text-primary">{label}</p>
      <div className="space-y-2">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-5 text-xs">
            <span className="flex items-center gap-2 text-text-tertiary">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
              {item.name}
            </span>
            <span className="font-semibold text-text-primary">{item.value ?? "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
