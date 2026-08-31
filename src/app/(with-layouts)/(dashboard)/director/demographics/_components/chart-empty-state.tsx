interface ChartEmptyStateProps {
  message: string;
  detail?: string;
}

export default function ChartEmptyState({ message, detail }: ChartEmptyStateProps) {
  return (
    <div
      role="status"
      className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-card-border bg-card-background p-5 text-center"
    >
      <div>
        <p className="text-sm font-medium text-text-secondary">{message}</p>
        {detail ? <p className="mt-1 text-xs leading-5 text-text-tertiary">{detail}</p> : null}
      </div>
    </div>
  );
}
