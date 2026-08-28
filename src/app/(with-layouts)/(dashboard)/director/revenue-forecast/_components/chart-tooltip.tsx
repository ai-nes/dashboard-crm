import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";

type RevenueChartTooltipProps = Partial<TooltipContentProps<ValueType, NameType>> & {
  valueSuffix?: string;
};

export default function RevenueChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: RevenueChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-xl border border-card-border bg-dropdowns-background p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-text-primary">{label}</p>
      <div className="space-y-2">
        {payload
          .filter((entry) => entry.value !== null && entry.value !== undefined)
          .map((entry, index) => (
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
