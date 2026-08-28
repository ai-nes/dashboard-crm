import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";

type DirectorChartTooltipProps = Partial<TooltipContentProps<ValueType, NameType>> & {
  valueSuffix?: string;
};

export default function DirectorChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: DirectorChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-xl border border-card-border bg-dropdowns-background p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-text-primary">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={`${entry.dataKey?.toString() ?? "item"}-${index}`} className="flex items-center justify-between gap-5 text-xs">
            <span className="flex items-center gap-2 text-text-tertiary">
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-text-primary">
              {typeof entry.value === "number" ? entry.value.toLocaleString("vi-VN") : entry.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
