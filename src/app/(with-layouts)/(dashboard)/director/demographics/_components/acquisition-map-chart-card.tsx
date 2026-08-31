import type { ReactNode } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

interface AcquisitionMapChartCardProps {
  chartId: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  badge?: string;
}

export default function AcquisitionMapChartCard({
  chartId,
  title,
  description,
  children,
  className,
  badge,
}: AcquisitionMapChartCardProps) {
  return (
    <Card className={`min-w-0 overflow-hidden bg-card-background p-0 ${className ?? ""}`}>
      <CardHeader className="items-start border-b border-card-border p-4">
        <div className="min-w-0" data-chart-id={chartId}>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">{description}</p>
        </div>
        {badge ? <span className="shrink-0 text-xs font-medium text-text-tertiary">{badge}</span> : null}
      </CardHeader>
      <div className="min-w-0 p-4">{children}</div>
    </Card>
  );
}

export function DemoLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-text-secondary">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[11px] leading-5 text-text-tertiary">{children}</p>;
}

export function formatDemoNumber(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function formatDemoCurrency(value: number): string {
  if (value === 0) return "Không có chi phí trực tiếp";
  return `${value.toLocaleString("vi-VN")} nghìn`;
}
