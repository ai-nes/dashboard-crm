interface ResultTrendTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}

export default function ResultTrendTooltip({ active, payload, label }: ResultTrendTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-md">
      <p className="mb-1.5 font-semibold text-text-primary">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center justify-between gap-6 py-0.5 text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.name}
          </span>
          <strong className="text-text-primary">{item.value}</strong>
        </p>
      ))}
    </div>
  );
}
