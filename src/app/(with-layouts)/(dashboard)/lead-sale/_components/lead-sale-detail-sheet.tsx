"use client";

import { ArrowRight, Close, InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";

import type { LeadSaleDetail, LeadSaleTone } from "./lead-sale-dashboard.types";

interface LeadSaleDetailSheetProps {
  detail: LeadSaleDetail | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDetail: (detailId: LeadSaleDetail["id"]) => void;
}

const toneBadge: Record<LeadSaleTone, "primary" | "warning" | "error" | "violet" | "success"> = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "error",
  violet: "violet",
};

const toneIcon: Record<LeadSaleTone, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-badge-success-background text-badge-success-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
  danger: "bg-badge-error-background text-badge-error-text",
  violet: "bg-badge-violet-background text-badge-violet-text",
};

export default function LeadSaleDetailSheet({ detail, isOpen, onOpenChange, onOpenDetail }: LeadSaleDetailSheetProps) {
  return (
    <SheetOverlay isOpen={isOpen && Boolean(detail)} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-label="Chi tiết hồ sơ tuyển sinh"
        className="w-full max-w-full overflow-y-auto border-l border-card-border bg-card-background p-0 sm:max-w-2xl"
      >
        {detail ? (
          <>
            <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-card-border bg-card-background px-5 py-4 sm:px-6">
              <SheetHeader className="min-w-0">
                <div className="flex items-start gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneIcon[detail.tone]}`} aria-hidden="true">
                    <InfoTriangle size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-text-tertiary">{detail.eyebrow}</p>
                    <SheetTitle className="mt-1 text-base font-bold text-text-primary">{detail.title}</SheetTitle>
                    <SheetDescription className="mt-1 text-xs leading-5 text-text-tertiary">{detail.description}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <Button size="xs" appearance="ghost" onPress={() => onOpenChange(false)} aria-label="Đóng bảng chi tiết" className="size-8 shrink-0 p-0 text-text-secondary hover:text-text-primary">
                <Close size={18} />
              </Button>
            </div>

            <SheetBody className="space-y-5 px-5 py-5 sm:px-6">
              <div className="grid grid-cols-3 gap-2">
                {detail.metrics.map((metric) => (
                  <div key={metric.label} className="min-w-0 rounded-xl border border-card-border bg-background-soft-50 p-3">
                    <p className="truncate text-[10px] font-medium text-text-tertiary">{metric.label}</p>
                    <p className="mt-1 truncate text-lg font-semibold tracking-[-0.4px] text-text-primary">{metric.value}</p>
                    {metric.note ? <p className="mt-0.5 truncate text-[10px] text-text-tertiary">{metric.note}</p> : null}
                  </div>
                ))}
              </div>

              {detail.breakdown?.length ? (
                <section aria-labelledby="lead-sale-detail-breakdown-title">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 id="lead-sale-detail-breakdown-title" className="text-sm font-semibold text-text-primary">
                        {detail.kind === "stage-breakdown" ? "Phân bổ theo giai đoạn" : "Phân bổ theo nhân viên tư vấn"}
                      </h2>
                      <p className="mt-1 text-xs text-text-tertiary">Chọn một dòng để đi tiếp xuống đúng nhóm nghiệp vụ.</p>
                    </div>
                    <Badge color={toneBadge[detail.tone]} size="sm">{detail.breakdown.length} nhóm</Badge>
                  </div>

                  <div className="mt-3 divide-y divide-card-border rounded-xl border border-card-border">
                    {detail.breakdown.map((row) => (
                      <Button
                        key={row.id}
                        type="button"
                        variant="ghost"
                        appearance="ghost"
                        onPress={() => row.detailId && onOpenDetail(row.detailId)}
                        className="group flex h-auto w-full items-center justify-between gap-4 rounded-none px-4 py-3 text-left first:rounded-t-xl last:rounded-b-xl hover:bg-background-soft-50"
                        isDisabled={!row.detailId}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-text-primary">{row.label}</span>
                          <span className="mt-1 block text-xs text-text-tertiary">{row.note}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-right">
                          <span className="text-sm font-semibold text-text-primary">{row.value}</span>
                          {row.detailId ? <ArrowRight size={15} aria-hidden="true" className="text-text-tertiary transition-transform group-hover:translate-x-0.5" /> : null}
                        </span>
                      </Button>
                    ))}
                  </div>
                </section>
              ) : null}

              {detail.records.length ? <section aria-labelledby="lead-sale-detail-list-title">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 id="lead-sale-detail-list-title" className="text-sm font-semibold text-text-primary">
                      {detail.breakdown?.length ? "Một số hồ sơ mẫu" : "Danh sách hồ sơ liên quan"}
                    </h2>
                    <p className="mt-1 text-xs text-text-tertiary">Các dòng mẫu minh họa cho bước drill-down tiếp theo của CRM.</p>
                  </div>
                  <Badge color={toneBadge[detail.tone]} size="sm">{detail.records.length} hồ sơ</Badge>
                </div>

                <div className="mt-3 space-y-3">
                  {detail.records.map((record) => (
                    <DetailRecordCard key={record.id} record={record} />
                  ))}
                </div>
              </section> : null}

              <section className="rounded-xl border border-primary-100 bg-primary-50/60 p-4" aria-labelledby="lead-sale-detail-action-title">
                <h2 id="lead-sale-detail-action-title" className="text-xs font-semibold text-primary-700">Gợi ý xử lý</h2>
                <p className="mt-1.5 text-sm leading-6 text-primary-700">{detail.recommendedAction}</p>
              </section>
            </SheetBody>
          </>
        ) : null}
      </SheetContent>
    </SheetOverlay>
  );
}

function DetailRecordCard({ record }: { record: LeadSaleDetail["records"][number] }) {
  return (
    <div className="rounded-xl border border-card-border bg-card-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">{record.initials}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{record.name}</p>
            <Badge color={toneBadge[record.tone]} size="sm">{record.issue}</Badge>
          </div>
          <p className="mt-1 text-xs text-text-tertiary">{record.owner} · {record.stage} · {record.age}</p>
        </div>
      </div>
      <dl className="mt-3 grid gap-3 border-t border-card-border pt-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-text-tertiary">Hoạt động gần nhất</dt>
          <dd className="mt-1 font-medium text-text-primary">{record.lastActivity}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Bước tiếp theo</dt>
          <dd className="mt-1 font-medium text-primary-600">{record.nextAction}</dd>
        </div>
      </dl>
    </div>
  );
}
