"use client";

import { CheckCircle1, InfoTriangle, Phone, Shield1Check } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import StudentDecisionScore from "./student-decision-score";
import type { Student360SectionProps } from "./types";

export default function StudentClassificationCockpit({ data }: Student360SectionProps) {
  const classification = data.classification;
  const confirmed = classification.reviewStatus === "Đã xác nhận";
  const barrier = classification.dimensions?.find((dimension) => dimension.id === "barrier")?.value || "-";
  const decisionMaker = [data.parentProfile?.name, data.parentProfile?.relation].filter(Boolean).join(" · ") || "-";
  const preferredChannel = data.parentProfile?.preferredChannel || "-";
  const bestContactTime = data.parentProfile?.bestContactTime || "-";
  const reviewerText = confirmed
    ? (classification.reviewedBy ? `Đã xác nhận bởi ${classification.reviewedBy}.` : "Đã xác nhận.")
    : (classification.reviewedBy ? `Chờ ${classification.reviewedBy} xác nhận.` : "Chờ xác nhận.");

  return (
    <Card className="mt-4 overflow-hidden border-primary-200/70 p-0 shadow-sm">
      <CardHeader className="border-b border-card-border px-5 py-4 lg:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2"><CardTitle>Vì sao cần chăm sóc học sinh này</CardTitle><Badge color={confirmed ? "success" : "warning"}>{confirmed ? <CheckCircle1 size={13} aria-hidden="true" /> : <InfoTriangle size={13} aria-hidden="true" />}{classification.reviewStatus || "Chờ xác nhận"}</Badge></div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Đánh giá và hành động tiếp theo, cập nhật theo tín hiệu mới nhất.</p>
        </div>
        <div className="text-right text-xs leading-5 text-text-tertiary"><p>Cập nhật {formatDateTime(classification.updatedAt)}</p><p>{classification.updateTrigger || "-"}</p></div>
      </CardHeader>

      <div className="grid min-w-0 items-stretch divide-y divide-card-border xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] xl:divide-x xl:divide-y-0">
        <div className="min-w-0 divide-y divide-card-border">
          <StudentDecisionScore data={data} />
        </div>

        <section className="flex min-w-0 flex-col p-5 xl:p-6" aria-labelledby="next-action-heading">
          <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-text-primary">Hành động tiếp theo</p><Badge color="primary">Hôm nay</Badge></div>
          <div className="mt-7"><h3 id="next-action-heading" className="max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">{classification.action || "Chưa có hành động cụ thể"}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">{barrier !== "-" ? `Mục tiêu: xử lý ${barrier.toLowerCase()} trước cuộc gọi.` : "Mục tiêu: chuẩn bị phương án tư vấn trước cuộc gọi."}</p></div>
          <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-card-border py-4">
            <div><dt className="text-[11px] text-text-tertiary">Rào cản cần xử lý</dt><dd className="mt-1 text-sm font-semibold text-warning-500">{barrier}</dd></div>
            <div><dt className="text-[11px] text-text-tertiary">Người quyết định</dt><dd className="mt-1 truncate text-sm font-semibold text-text-primary" title={decisionMaker}>{decisionMaker}</dd></div>
            <div><dt className="text-[11px] text-text-tertiary">Kênh ưu tiên</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{preferredChannel}</dd></div>
            <div><dt className="text-[11px] text-text-tertiary">Khung giờ</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{bestContactTime}</dd></div>
          </dl>
          <div className="relative mt-5 flex flex-wrap gap-2"><Button size="sm" onPress={() => toast.success(`Đã tạo cuộc gọi tư vấn cho ${data.student.name}.`)}><Phone size={16} aria-hidden="true" />Gọi tư vấn</Button></div>
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-card-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-text-secondary">
          <Shield1Check size={16} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />
          <span>{reviewerText}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="xs" appearance="outline" onPress={() => toast.success("Đã ghi nhận xác nhận phân loại.")}><CheckCircle1 size={14} />Xác nhận đúng</Button>
          <Button size="xs" appearance="ghost" onPress={() => toast.info("Đã gửi yêu cầu điều chỉnh đánh giá.")}>Đánh giá lại</Button>
        </div>
      </div>
    </Card>
  );
}
