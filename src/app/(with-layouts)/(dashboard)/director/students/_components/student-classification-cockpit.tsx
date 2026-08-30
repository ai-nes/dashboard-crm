"use client";

import { ArrowRight, CheckCircle1, InfoTriangle, Shield1Check } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import StudentClassificationSnapshot from "./student-classification-snapshot";
import StudentDecisionMap from "./student-decision-map";
import type { Student360SectionProps } from "./types";

export default function StudentClassificationCockpit({ data }: Student360SectionProps) {
  const classification = data.classification;
  const confirmed = classification.reviewStatus === "Đã xác nhận";

  return (
    <Card className="mt-4 border-primary-200/70 p-5 shadow-sm">
      <CardHeader className="mb-5 items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Phân loại tuyển sinh 4 chiều</CardTitle>
            <Badge color={confirmed ? "success" : "warning"}>{confirmed ? <CheckCircle1 size={13} aria-hidden="true" /> : <InfoTriangle size={13} aria-hidden="true" />}{classification.reviewStatus}</Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tách riêng giai đoạn, quan tâm, mức phù hợp và rào cản để giải thích quyết định chăm sóc.</p>
        </div>
        <div className="text-right text-xs leading-5 text-text-tertiary"><p>Cập nhật {classification.updatedAt}</p><p>{classification.updateTrigger}</p></div>
      </CardHeader>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <StudentDecisionMap data={data} />
        <StudentClassificationSnapshot data={data} />
      </div>

      <div className="mt-4 grid items-center gap-4 rounded-2xl border border-primary-200 bg-badge-primary-background p-4 lg:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)]">
        <div className="min-w-0"><p className="text-[11px] font-medium text-text-tertiary">Tổ hợp hiện tại</p><p className="mt-1 text-sm leading-6 font-semibold text-text-primary">{classification.combination}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{classification.interpretation}</p></div>
        <span className="hidden size-9 items-center justify-center rounded-full bg-card-background text-primary-500 lg:flex" aria-hidden="true"><ArrowRight size={17} /></span>
        <div className="min-w-0 rounded-xl bg-card-background p-3"><p className="text-[11px] font-semibold tracking-wide text-primary-500 uppercase">Hành động theo quy tắc</p><p className="mt-1 text-sm leading-6 font-semibold text-text-primary">{classification.action}</p></div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-text-secondary"><Shield1Check size={16} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" /><span>{confirmed ? `Đã được ${classification.reviewedBy} xác nhận; hệ thống sẽ tiếp tục cập nhật khi có tương tác mới.` : `Đang chờ ${classification.reviewedBy} kiểm tra trước khi dùng để ưu tiên chăm sóc.`}</span></div>
        <div className="flex shrink-0 gap-2"><Button size="xs" appearance="outline" onPress={() => toast.success("Đã ghi nhận xác nhận phân loại.")}><CheckCircle1 size={14} />Xác nhận đúng</Button><Button size="xs" appearance="ghost" onPress={() => toast.info("Đã mở yêu cầu điều chỉnh phân loại mô phỏng.")}>Đề xuất điều chỉnh</Button></div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Nguồn hình thành dữ liệu">
        <div className="rounded-xl border border-info-500/20 bg-badge-sky-background p-3"><p className="text-[11px] font-semibold text-badge-sky-text">Học sinh / phụ huynh cung cấp</p><p className="mt-1 text-xs leading-5 text-text-secondary">Thông tin liên hệ, trường, nguyện vọng và mối quan tâm được ghi nhận qua biểu mẫu, sự kiện và hội thoại.</p></div>
        <div className="rounded-xl border border-violet-300/40 bg-badge-violet-background p-3"><p className="text-[11px] font-semibold text-badge-violet-text">Hệ thống suy luận</p><p className="mt-1 text-xs leading-5 text-text-secondary">Phân loại 4 chiều, xác suất và mức sẵn sàng; kết quả đã được {confirmed ? "tư vấn viên xác nhận" : "đánh dấu chờ xác nhận"}.</p></div>
      </div>
    </Card>
  );
}
