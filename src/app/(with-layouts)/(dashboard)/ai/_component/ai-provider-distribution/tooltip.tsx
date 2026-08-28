import { TooltipContentProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export default function ProviderDistributionTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as { name: string; value: number };
    return (
      <div className="rounded-xl border border-card-border bg-card-background p-3 shadow-md">
        <p className="mb-1 text-xs font-semibold text-text-primary">{data.name}</p>
        <p className="text-xs text-text-secondary">
          Share: <span className="font-semibold text-text-primary">{data.value}%</span>
        </p>
      </div>
    );
  }
  return null;
}
