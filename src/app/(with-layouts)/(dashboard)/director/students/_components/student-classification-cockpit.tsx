"use client";

import { CheckCircle1, Envelope1, InfoTriangle, Phone, Shield1Check } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import StudentActionPlan from "./student-action-plan";
import StudentDecisionScore from "./student-decision-score";
import StudentPriorityReasons from "./student-priority-reasons";
import StudentSignalStream from "./student-signal-stream";
import type { Student360SectionProps } from "./types";

export default function StudentClassificationCockpit({ data }: Student360SectionProps) {
  const classification = data.classification;
  const confirmed = classification.reviewStatus === "Đã xác nhận";
  const barrier = classification.dimensions.find((dimension) => dimension.id === "barrier")?.value ?? "Chưa xác định";

  return (
    <Card className="mt-4 overflow-hidden border-primary-200/70 p-0 shadow-sm">
      <CardHeader className="border-b border-card-border px-5 py-4 lg:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2"><CardTitle>Trung tâm quyết định</CardTitle><Badge color={confirmed ? "success" : "warning"}>{confirmed ? <CheckCircle1 size={13} aria-hidden="true" /> : <InfoTriangle size={13} aria-hidden="true" />}{classification.reviewStatus}</Badge></div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Một khung nhìn để biết ai, đang ở đâu, vướng gì và nên làm gì tiếp theo.</p>
        </div>
        <div className="text-right text-xs leading-5 text-text-tertiary"><p>Cập nhật {classification.updatedAt}</p><p>{classification.updateTrigger}</p></div>
      </CardHeader>

      <div className="grid min-w-0 items-stretch divide-y divide-card-border xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] xl:divide-x xl:divide-y-0">
        <div className="min-w-0 divide-y divide-card-border">
          <StudentDecisionScore data={data} />
          <StudentPriorityReasons data={data} />
        </div>

        <section className="flex min-w-0 flex-col p-5 xl:p-6" aria-labelledby="next-action-heading">
          <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-text-primary">Hành động tiếp theo</p><p className="mt-1 text-xs text-text-tertiary">Hành động cần được kích hoạt trong ngày</p></div><Badge color="primary">Ưu tiên cao</Badge></div>
          <div className="mt-7"><h3 id="next-action-heading" className="max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">{classification.action}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">{classification.interpretation}</p></div>
          <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-card-border py-4"><div><dt className="text-[11px] text-text-tertiary">Rào cản cần xử lý</dt><dd className="mt-1 text-sm font-semibold text-warning-500">{barrier}</dd></div><div><dt className="text-[11px] text-text-tertiary">Người đồng quyết định</dt><dd className="mt-1 truncate text-sm font-semibold text-text-primary">{data.parentProfile.name} · {data.parentProfile.relation}</dd></div><div><dt className="text-[11px] text-text-tertiary">Kênh ưu tiên</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{data.parentProfile.preferredChannel}</dd></div><div><dt className="text-[11px] text-text-tertiary">Khung giờ</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{data.parentProfile.bestContactTime}</dd></div></dl>
          <StudentActionPlan data={data} />
          <div className="relative mt-5 flex flex-wrap gap-2"><Button size="sm" onPress={() => toast.success(`Đã tạo cuộc gọi tư vấn cho ${data.student.name}.`)}><Phone size={16} aria-hidden="true" />Gọi tư vấn</Button><Button size="sm" appearance="outline" onPress={() => toast.success("Đã chuẩn bị phương án học phí và học bổng.")}><Envelope1 size={16} aria-hidden="true" />Gửi phương án</Button></div>
        </section>
      </div>

      <StudentSignalStream events={data.journey} />

      <div className="flex flex-col gap-3 border-t border-card-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6"><div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-text-secondary"><Shield1Check size={16} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" /><span>{confirmed ? `Đã được ${classification.reviewedBy} xác nhận; hệ thống sẽ tiếp tục cập nhật khi có tương tác mới.` : `Đang chờ ${classification.reviewedBy} kiểm tra trước khi dùng để ưu tiên chăm sóc.`}</span></div><div className="flex shrink-0 gap-2"><Button size="xs" appearance="outline" onPress={() => toast.success("Đã ghi nhận xác nhận phân loại.")}><CheckCircle1 size={14} />Xác nhận đúng</Button><Button size="xs" appearance="ghost" onPress={() => toast.info("Đã mở yêu cầu điều chỉnh phân loại mô phỏng.")}>Đề xuất điều chỉnh</Button></div></div>

      <div className="grid gap-3 border-t border-card-border p-5 sm:grid-cols-2 lg:px-6" aria-label="Nguồn hình thành dữ liệu"><div className="rounded-xl border border-info-500/20 bg-badge-sky-background p-3"><p className="text-[11px] font-semibold text-badge-sky-text">Học sinh / phụ huynh cung cấp</p><p className="mt-1 text-xs leading-5 text-text-secondary">Liên hệ, trường, nguyện vọng và mối quan tâm từ biểu mẫu, sự kiện và hội thoại.</p></div><div className="rounded-xl border border-violet-300/40 bg-badge-violet-background p-3"><p className="text-[11px] font-semibold text-badge-violet-text">Hệ thống suy luận</p><p className="mt-1 text-xs leading-5 text-text-secondary">Phân loại, xác suất và mức sẵn sàng; {confirmed ? "đã được tư vấn viên xác nhận" : "đang chờ xác nhận"}.</p></div></div>
    </Card>
  );
}
