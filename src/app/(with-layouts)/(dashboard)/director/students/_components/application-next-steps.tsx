import { ArrowRight, Phone } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";

import type { Student360SectionProps } from "./types";

const stepTone = {
  warning: "bg-badge-warning-background text-badge-warning-text",
  primary: "bg-badge-primary-background text-badge-primary-text",
  success: "bg-badge-success-background text-badge-success-text",
} as const;

export default function ApplicationNextSteps({ data }: Student360SectionProps) {
  const scholarship = data.application.find((item) => item.label === "Học bổng")?.value ?? "Đề xuất mức 30%";
  const status = data.application.find((item) => item.label === "Trạng thái hồ sơ")?.value ?? "Chưa bắt đầu · 0/5 tài liệu";
  const completedDocuments = Number(status.match(/(\d)\/5/)?.[1] ?? 0);
  const steps = [
    { index: "01", label: "Gửi thông tin quyết định", detail: `Theo đúng rào cản ${data.insight.concern.toLowerCase()}`, tone: "warning" },
    { index: "02", label: "Chốt phương án học bổng", detail: scholarship, tone: "primary" },
    { index: "03", label: completedDocuments > 0 ? "Hoàn tất tài liệu còn thiếu" : "Bắt đầu 5 tài liệu", detail: completedDocuments > 0 ? `Đã có ${completedDocuments}/5 tài liệu` : "Mở hồ sơ sau khi phụ huynh đồng ý", tone: "success" },
  ] as const;

  return (
    <div className="mt-5 rounded-2xl border border-card-border bg-background-gray-primary p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary-500 uppercase">Lộ trình mở hồ sơ</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">Ba việc giúp chuyển từ quan tâm sang nộp hồ sơ.</p>
        </div>
        <Badge color="primary">48 giờ tới</Badge>
      </div>

      <ol className="mt-4 divide-y divide-card-border rounded-xl bg-card-background px-3" aria-label="Các việc cần làm để mở hồ sơ">
        {steps.map((step) => (
          <li key={step.index} className="flex items-center gap-3 py-3 first:pt-3 last:pb-3">
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${stepTone[step.tone]}`}>{step.index}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{step.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-text-tertiary">{step.detail}</p>
            </div>
            <ArrowRight size={15} className="shrink-0 text-icon-tertiary" aria-hidden="true" />
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-badge-primary-background p-3">
        <Phone size={17} className="shrink-0 text-primary-500" aria-hidden="true" />
        <div className="min-w-0 flex-1"><p className="text-[11px] text-badge-primary-text">Bước tiếp theo</p><p className="mt-0.5 truncate text-xs font-semibold text-text-primary">{data.classification.action}</p></div>
        <ArrowRight size={15} className="shrink-0 text-primary-500" aria-hidden="true" />
      </div>
    </div>
  );
}
