import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { sourcePerformance } from "./data";

function formatPercent(value: number) {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
}

export default function FunnelSourceChart() {
  const rows = sourcePerformance.map((source) => ({
    ...source,
    firstStepRate: source.stepRates[0],
    finalRate: source.stepRates.reduce((rate, stepRate) => rate * (stepRate / 100), 100),
  })).sort((a, b) => b.finalRate - a.finalRate);

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Hiệu quả từng nguồn tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ hồ sơ nhập học trên tổng hồ sơ của mỗi nguồn.</p>
        </div>
      </CardHeader>

      <div className="space-y-4" role="img" aria-label="Biểu đồ xếp hạng tỷ lệ nhập học theo nguồn">
        {rows.map((row, index) => (
          <div key={row.source}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-text-primary">{index + 1}. {row.source}</p>
              <span className="text-sm font-semibold text-success-500">{formatPercent(row.finalRate)}%</span>
            </div>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-background-soft-50">
                <div className="h-full rounded-full bg-success-500" style={{ width: `${row.finalRate}%` }} />
              </div>
              <span className="shrink-0 whitespace-nowrap text-[11px] text-text-tertiary">Bước 1: {formatPercent(row.firstStepRate)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
