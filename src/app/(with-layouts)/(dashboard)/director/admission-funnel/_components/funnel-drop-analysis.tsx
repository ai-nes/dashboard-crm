import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";

function formatPercent(value: number) {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
}

export default function FunnelDropAnalysis() {
  const { dropOffs } = useAdmissionFunnelData();
  const rows = dropOffs.slice(0, 3).map((dropOff) => ({
    from: dropOff.fromLabel,
    to: dropOff.toLabel,
    dropCount: dropOff.dropCount,
    dropRate: dropOff.dropRate,
  }));
  const maxDropRate = rows[0]?.dropRate ?? 1;

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Hồ sơ giảm qua từng bước</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh số hồ sơ không chuyển sang bước tiếp theo.</p>
        </div>
      </CardHeader>

      <div className="space-y-5" role="img" aria-label="Biểu đồ ba bước có tỷ lệ hồ sơ giảm nhiều nhất">
        {rows.map((row, index) => (
          <div key={`${row.from}-${row.to}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-sm font-medium text-text-primary">{row.from} <span className="text-text-tertiary">→</span> {row.to}</p>
              <span className={`shrink-0 text-sm font-semibold ${index === 0 ? "text-error-500" : "text-warning-500"}`}>-{formatPercent(row.dropRate)}%</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-background-soft-50">
                <div className={`h-full rounded-full ${index === 0 ? "bg-error-500" : "bg-warning-500"}`} style={{ width: `${(row.dropRate / maxDropRate) * 100}%` }} />
              </div>
              <span className="w-28 shrink-0 text-right text-xs text-text-tertiary">{row.dropCount.toLocaleString("vi-VN")} hồ sơ</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
