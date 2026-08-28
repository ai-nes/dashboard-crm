import { ArrowRight, InfoTriangle } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const DECISIONS = [
  { id: "retention", title: "Khóa lịch chăm sóc nhóm đã nộp hồ sơ", note: "+18B doanh thu có thể bảo vệ", tone: "bg-badge-success-background text-badge-success-text" },
  { id: "discount", title: "Rà soát nhóm giảm trừ vượt ngưỡng", note: "Giảm 6B chiết khấu dự kiến", tone: "bg-badge-warning-background text-badge-warning-text" },
];

export default function RevenueDecisionCard() {
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Điểm cần quyết định</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Đòn bẩy có thể tác động forecast</p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2 py-1 text-[11px] font-semibold text-badge-primary-text">2 đề xuất</span>
      </CardHeader>

      <div className="mt-5 rounded-xl bg-card-background p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-badge-warning-background text-badge-warning-text">
              <InfoTriangle size={14} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-text-primary">Đòn bẩy ưu tiên</span>
              <span className="mt-1 block text-[11px] text-text-tertiary">Tác động cao, có thể kích hoạt ngay</span>
            </span>
          </div>
          <span className="shrink-0 text-lg font-semibold text-success-500">+18B</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {DECISIONS.map((decision, index) => (
          <div key={decision.id} className="flex items-center gap-2.5 rounded-xl bg-card-background p-3">
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${decision.tone}`}>{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-text-secondary">{decision.title}</p>
              <p className="mt-1 text-[11px] text-text-tertiary">{decision.note}</p>
            </div>
            <ArrowRight size={14} className="shrink-0 text-icon-tertiary" aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-card-border pt-4 text-xs font-semibold text-brand-500">Mở trung tâm hành động →</div>
    </Card>
  );
}
