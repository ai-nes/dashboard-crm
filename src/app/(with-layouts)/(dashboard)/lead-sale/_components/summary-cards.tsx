import { ArrowRight, CheckCircle1, Layers2, Target3, TrendUp2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { LeadSaleDetailId, LeadSaleSummary } from "./lead-sale-dashboard.types";

interface SummaryCardsProps {
  summary: LeadSaleSummary;
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

export default function SummaryCards({ summary, onOpenDetail }: SummaryCardsProps) {
  return (
    <section aria-label="Kết quả và dự báo" className="space-y-3">
      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
        <Button
          type="button"
          variant="ghost"
          appearance="ghost"
          onPress={() => onOpenDetail("enrollment")}
          className="group relative flex h-auto min-h-40 w-full items-stretch justify-between overflow-hidden rounded-2xl border border-card-border bg-card-background p-5 text-left shadow-xs hover:bg-background-soft-50 sm:p-6"
        >
          <div className="relative z-10 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-badge-success-background text-badge-success-text">
                <CheckCircle1 size={18} aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-text-secondary">Đã nhập học</span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <span className="text-4xl leading-none font-semibold tracking-[-1.4px] text-text-primary">{summary.enrollment}</span>
              <span className="mb-0.5 text-xs text-text-tertiary">/ {summary.target} chỉ tiêu</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">Đội đã đạt {summary.achievement}% chỉ tiêu trong kỳ tuyển sinh.</p>
          </div>
          <div className="relative z-10 flex shrink-0 flex-col items-end justify-between">
            <ArrowRight size={18} aria-hidden="true" className="text-text-tertiary transition-transform group-hover:translate-x-0.5" />
            <span className="text-[11px] font-semibold text-primary-600">Xem hồ sơ đã nhập học</span>
          </div>
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-1 bg-success-500/20" aria-hidden="true">
            <div className="h-full bg-success-500" style={{ width: `${summary.achievement}%` }} />
          </div>
        </Button>

        <Button
          type="button"
          variant="ghost"
          appearance="ghost"
          onPress={() => onOpenDetail("forecast")}
          className="group flex h-auto min-h-40 w-full flex-col items-stretch rounded-2xl border border-card-border bg-card-background p-5 text-left shadow-xs hover:bg-background-soft-50 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-badge-violet-background text-badge-violet-text">
                <TrendUp2 size={18} aria-hidden="true" />
              </div>
              <p className="whitespace-nowrap text-xs font-semibold text-text-secondary">Dự kiến nhập học</p>
            </div>
            <ArrowRight size={18} aria-hidden="true" className="text-text-tertiary transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-4">
            <p className="mt-1 text-3xl font-semibold tracking-[-1px] text-text-primary">{summary.expected}</p>
            <p className="mt-2 text-xs leading-5 text-text-tertiary">Ước tính từ {summary.openOpportunities} cơ hội đang mở, không phải kết quả chắc chắn.</p>
          </div>
        </Button>

        <Button
          type="button"
          variant="ghost"
          appearance="ghost"
          onPress={() => onOpenDetail("forecast")}
          className="group flex h-auto min-h-40 w-full flex-col items-stretch rounded-2xl border border-card-border bg-card-background p-5 text-left shadow-xs hover:bg-background-soft-50 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Target3 size={18} aria-hidden="true" />
              </div>
              <p className="whitespace-nowrap text-xs font-semibold text-text-secondary">Độ phủ chỉ tiêu</p>
            </div>
            <ArrowRight size={18} aria-hidden="true" className="text-text-tertiary transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-3xl font-semibold tracking-[-1px] text-success-500">{summary.coverage.toFixed(2).replace(".", ",")}x</p>
              <Badge color={summary.coverage >= 1 ? "success" : "warning"} size="sm">
                {summary.coverage >= 1 ? "Đủ theo dự báo" : "Thiếu theo dự báo"}
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-text-tertiary">{summary.expected} dự kiến / {summary.remaining} chỉ tiêu còn thiếu. Bấm để xem nguồn của dự báo.</p>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="Chỉ tiêu còn thiếu" value={summary.remaining} note="Số nhập học cần bổ sung" icon={Target3} tone="warning" onOpenDetail={() => onOpenDetail("forecast")} />
        <MetricTile label="Cơ hội đang mở" value={summary.openOpportunities} note={`+${summary.newOpportunities} cơ hội mới`} icon={Layers2} tone="primary" onOpenDetail={() => onOpenDetail("forecast")} />
        <MetricTile label="Tỷ lệ nhập học" value={`${summary.winRate}%`} note="Cơ hội → Nhập học" icon={CheckCircle1} tone="success" onOpenDetail={() => onOpenDetail("stage-opportunity")} />
        <MetricTile label="Hồ sơ vượt SLA" value={summary.agingOverSla} note="Không đồng nghĩa tuổi ≥ 6 ngày" icon={TrendUp2} tone="danger" onOpenDetail={() => onOpenDetail("aging")} />
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  note,
  icon: Icon,
  tone,
  onOpenDetail,
}: {
  label: string;
  value: number | string;
  note: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  tone: "primary" | "success" | "warning" | "danger";
  onOpenDetail: () => void;
}) {
  const styles = {
    primary: { icon: "bg-primary-50 text-primary-600", value: "text-primary-600" },
    success: { icon: "bg-badge-success-background text-badge-success-text", value: "text-success-500" },
    warning: { icon: "bg-badge-warning-background text-badge-warning-text", value: "text-warning-500" },
    danger: { icon: "bg-badge-error-background text-badge-error-text", value: "text-badge-error-text" },
  }[tone];

  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      onPress={onOpenDetail}
      className="group flex h-auto min-w-0 w-full items-start justify-start rounded-xl border border-card-border bg-card-background p-3.5 text-left shadow-xs hover:bg-background-soft-50 sm:p-4"
    >
      <div className="flex items-start gap-3">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon size={16} aria-hidden={true} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-text-tertiary">{label}</p>
          <p className={`mt-1 text-xl font-semibold tracking-[-0.5px] ${styles.value}`}>{value}</p>
          <p className="mt-1 truncate text-[10px] text-text-tertiary">{note}</p>
        </div>
      </div>
    </Button>
  );
}
