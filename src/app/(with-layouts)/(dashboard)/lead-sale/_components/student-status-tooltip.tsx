interface StudentStatusTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
}

export default function StudentStatusTooltip({ active, payload }: StudentStatusTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-2.5 text-xs shadow-md">
      <p className="font-semibold text-text-primary">{payload[0]?.name}</p>
      <p className="mt-1 text-text-secondary">{payload[0]?.value} học sinh</p>
    </div>
  );
}
