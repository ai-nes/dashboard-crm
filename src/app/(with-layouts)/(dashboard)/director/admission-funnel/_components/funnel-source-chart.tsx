import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";

function formatPercent(value: number | null) {
  return value === null ? "—" : `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

export default function FunnelSourceChart() {
  const { sourcePerformance } = useAdmissionFunnelData();
  const rows = sourcePerformance
    .map((source) => ({
      ...source,
      firstStepRate: source.stepRates[0],
    }))
    .sort((a, b) => (b.finalRate ?? -1) - (a.finalRate ?? -1))
    .slice(0, 5);

  return (
    <Card className="min-w-0 p-5 xl:h-full">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>5 nguồn tuyển sinh hiệu quả nhất</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ hồ sơ nhập học trên tổng hồ sơ của mỗi nguồn.</p>
        </div>
      </CardHeader>

      <div className="grid gap-4" role="img" aria-label="Biểu đồ xếp hạng năm nguồn có tỷ lệ nhập học cao nhất">
        {rows.map((row, index) => (
          <div key={row.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-text-primary">{index + 1}. {row.label}</p>
              <span className="text-sm font-semibold text-success-500">{formatPercent(row.finalRate)}</span>
            </div>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-background-soft-50">
                <div className="h-full rounded-full bg-success-500" style={{ width: `${row.finalRate ?? 0}%` }} />
              </div>
              <span className="shrink-0 whitespace-nowrap text-[11px] text-text-tertiary">Bước 1: {formatPercent(row.firstStepRate)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
