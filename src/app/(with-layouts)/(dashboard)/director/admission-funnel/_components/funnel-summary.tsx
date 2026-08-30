import { Card } from "@/components/tailgrids/core/card";

import { funnelStages } from "./data";

const total = funnelStages[0].count;
const enrolled = funnelStages[funnelStages.length - 1].count;
const enrollmentRate = (enrolled / total) * 100;
const firstStepRate = (funnelStages[1].count / funnelStages[0].count) * 100;

const summaryItems = [
  { label: "Hồ sơ tiềm năng", value: total, detail: "Tổng hồ sơ đầu vào", tone: "text-primary-500" },
  { label: "Đã nhập học", value: enrolled, detail: "Đã hoàn tất xác nhận", tone: "text-success-500" },
  { label: "Tỷ lệ nhập học", value: `${enrollmentRate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`, detail: "Trên tổng hồ sơ tiềm năng", tone: "text-success-500" },
  { label: "Bước cần ưu tiên", value: "Tiềm năng → Tương tác", detail: `${(100 - firstStepRate).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% hồ sơ chưa chuyển bước`, tone: "text-warning-500" },
];

export default function FunnelSummary() {
  return (
    <section aria-label="Tóm tắt phễu tuyển sinh" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.label} className="min-w-0 p-4">
          <p className="truncate text-xs text-text-tertiary">{item.label}</p>
          <p className={`mt-3 truncate text-xl font-semibold tracking-[-0.4px] ${item.tone}`}>{typeof item.value === "number" ? item.value.toLocaleString("vi-VN") : item.value}</p>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">{item.detail}</p>
        </Card>
      ))}
    </section>
  );
}
