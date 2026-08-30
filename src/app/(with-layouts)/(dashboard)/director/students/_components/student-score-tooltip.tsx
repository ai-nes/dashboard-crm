import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";

type ScoreTooltipData = {
  summary?: string;
  value?: number;
};

export default function StudentScoreTooltip({ active, payload, label }: Partial<TooltipContentProps<ValueType, NameType>>) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload as ScoreTooltipData | undefined;
  if (!item) return null;

  return (
    <div className="min-w-40 rounded-lg border border-card-border bg-card-background p-3 shadow-md">
      <p className="text-xs font-semibold text-text-primary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-primary-500">{item.value ?? 0}/100</p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{item.summary ?? "Chưa có dữ liệu"}</p>
    </div>
  );
}
