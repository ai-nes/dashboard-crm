import { Card } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";

function formatNumber(value: number | null) {
  return value === null ? "—" : value.toLocaleString("vi-VN");
}

function formatPercent(value: number | null) {
  return value === null ? "—" : `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

export default function FunnelSummary() {
  const { summary, stages } = useAdmissionFunnelData();
  const stageLabels = new Map(stages.map((stage) => [stage.id, stage.label]));
  const priorityLabel = summary.priorityStageId && summary.priorityNextStageId
    ? `${stageLabels.get(summary.priorityStageId) ?? summary.priorityStageId} → ${stageLabels.get(summary.priorityNextStageId) ?? summary.priorityNextStageId}`
    : "Chưa xác định";
  const summaryItems = [
    { label: "Hồ sơ tiềm năng", value: formatNumber(summary.prospects), detail: "Tổng hồ sơ đầu vào", tone: "text-primary-500" },
    { label: "Đã nhập học", value: formatNumber(summary.enrolled), detail: "Đã hoàn tất xác nhận", tone: "text-success-500" },
    { label: "Tỷ lệ nhập học", value: formatPercent(summary.enrollmentRate), detail: "Trên tổng hồ sơ tiềm năng", tone: "text-success-500" },
    { label: "Bước cần ưu tiên", value: priorityLabel, detail: summary.priorityDropRate === null ? "Chưa đủ dữ liệu để xác định" : `${formatPercent(summary.priorityDropRate)} hồ sơ chưa chuyển bước`, tone: "text-warning-500" },
  ];

  return (
    <section aria-label="Tóm tắt phễu tuyển sinh" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.label} className="min-w-0 p-4">
          <p className="truncate text-xs text-text-tertiary">{item.label}</p>
          <p className={`mt-3 truncate text-xl font-semibold tracking-[-0.4px] ${item.tone}`}>{item.value}</p>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">{item.detail}</p>
        </Card>
      ))}
    </section>
  );
}
