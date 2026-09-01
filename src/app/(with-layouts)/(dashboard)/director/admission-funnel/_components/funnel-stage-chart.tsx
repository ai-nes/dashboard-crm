import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";

function formatPercent(value: number | null) {
  return value === null ? "—" : value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
}

export default function FunnelStageChart() {
  const { stages, summary } = useAdmissionFunnelData();
  const stageLabels = new Map(stages.map((stage) => [stage.id, stage.label]));
  const biggestDrop = {
    from: summary.priorityStageId ? stageLabels.get(summary.priorityStageId) ?? summary.priorityStageId : "Chưa xác định",
    to: summary.priorityNextStageId ? stageLabels.get(summary.priorityNextStageId) ?? summary.priorityNextStageId : "Chưa xác định",
    drop: summary.priorityDropRate,
  };

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Phễu hồ sơ tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Mỗi thanh là số hồ sơ còn lại sau từng bước.</p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">7 bước</span>
      </CardHeader>

      <div className="mb-3 grid grid-cols-[minmax(135px,1fr)_minmax(0,3fr)_72px_88px] items-center gap-3 text-[10px] font-semibold tracking-wide text-text-tertiary uppercase sm:grid-cols-[minmax(170px,1fr)_minmax(0,3fr)_84px_104px]">
        <span>Giai đoạn</span>
        <span>Số hồ sơ</span>
        <span className="text-right">Tỷ lệ còn lại</span>
        <span className="text-right">Tỷ lệ chuyển tiếp</span>
      </div>

      <ol className="space-y-3" aria-label="Bảy bước trong phễu tuyển sinh">
        {stages.map((stage, index) => (
          <li key={stage.id} className="grid grid-cols-[minmax(135px,1fr)_minmax(0,3fr)_72px_88px] items-center gap-3 sm:grid-cols-[minmax(170px,1fr)_minmax(0,3fr)_84px_104px]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background-soft-50 text-[10px] font-semibold text-text-tertiary">{String(index + 1).padStart(2, "0")}</span>
              <p className="truncate text-xs font-medium text-text-primary sm:text-sm">{stage.label}</p>
              <span className="sr-only">{stage.description}</span>
            </div>
            <div className="relative h-9" aria-label={`${stage.label}: ${stage.count.toLocaleString("vi-VN")} hồ sơ`}>
              <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-lg ${index === stages.length - 1 ? "bg-success-500" : "bg-primary-500"}`} style={{ width: `${stage.remainingRate}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{stage.count.toLocaleString("vi-VN")}</span>
            <span className="text-right text-xs text-text-secondary">{formatPercent(stage.stepRate)}%</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-lg border border-warning-500/30 bg-badge-warning-background px-4 py-3">
        <p className="text-xs font-semibold text-badge-warning-text">Điểm giảm lớn nhất</p>
        <p className="mt-1 text-sm font-medium text-text-primary">{biggestDrop.from} → {biggestDrop.to}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {biggestDrop.drop === null
            ? "Chưa đủ dữ liệu để xác định tỷ lệ chuyển tiếp."
            : `Mất ${formatPercent(biggestDrop.drop)}% hồ sơ; chỉ ${formatPercent(100 - biggestDrop.drop)}% chuyển sang bước tiếp theo.`}
        </p>
      </div>
    </Card>
  );
}
