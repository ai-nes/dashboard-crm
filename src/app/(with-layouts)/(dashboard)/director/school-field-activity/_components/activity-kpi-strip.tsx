import { Card } from "@/components/tailgrids/core/card";

import type { FieldActivityKpi, FieldActivityKpiUnit } from "@/services/api/director-school-field-activity";

const toneStyles: Record<FieldActivityKpi["tone"], { marker: string; value: string }> = {
  primary: { marker: "bg-brand-500", value: "text-brand-500" },
  success: { marker: "bg-success-500", value: "text-success-500" },
  warning: { marker: "bg-warning-500", value: "text-warning-500" },
  error: { marker: "bg-error-500", value: "text-error-500" },
};

interface ActivityKpiStripProps {
  kpis: FieldActivityKpi[];
}

export default function ActivityKpiStrip({ kpis }: ActivityKpiStripProps) {
  return (
    <section aria-label="Tóm tắt hoạt động thực địa" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const styles = toneStyles[kpi.tone];

        return (
          <Card key={kpi.id} className="min-w-0 p-4">
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span className={`size-2 shrink-0 rounded-full ${styles.marker}`} aria-hidden="true" />
              <span className="truncate">{kpi.label}</span>
            </div>
            <p className={`mt-3 text-2xl font-semibold tracking-[-0.6px] ${styles.value}`}>{formatKpiValue(kpi.value, kpi.unit)}</p>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">{kpi.detail ?? formatKpiChange(kpi.change, kpi.changeUnit)}</p>
          </Card>
        );
      })}
    </section>
  );
}

function formatKpiValue(value: number | null, unit: FieldActivityKpiUnit): string {
  if (value === null) return "—";
  if (unit === "percent") return `${value.toFixed(1).replace(".", ",")}%`;
  if (unit === "million_vnd") return `${value.toFixed(1).replace(".", ",")} tr`;
  return value.toLocaleString("vi-VN");
}

function formatKpiChange(change: number | null, changeUnit: FieldActivityKpi["changeUnit"]): string {
  if (change === null || !changeUnit) return "Chưa có dữ liệu";
  const value = change.toFixed(1).replace(".", ",");
  if (changeUnit === "percent") return `${change >= 0 ? "Tăng" : "Giảm"} ${Math.abs(change).toLocaleString("vi-VN")}%; so với kỳ trước`;
  if (changeUnit === "percentage_points") return `${value} điểm phần trăm so với kỳ trước`;
  return `${change >= 0 ? "+" : ""}${value}`;
}
