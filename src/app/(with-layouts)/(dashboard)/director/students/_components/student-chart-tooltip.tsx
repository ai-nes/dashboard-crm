import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";

export default function StudentChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-lg border border-card-border bg-card-background p-3 shadow-md">
      <p className="mb-2 text-xs font-semibold text-text-primary">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const displayValue = item.value != null
            ? `${item.value}${item.name === "Xác suất" || item.name === "Xác suất nhập học" || item.name === "Tỷ lệ phản hồi" ? "%" : ""}`
            : "-";
          return (
            <div key={`${String(item.dataKey ?? item.name ?? "value")}-${index}`} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-text-secondary">{item.name}</span>
              <span className="font-semibold text-text-primary">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
