"use client";

import { Dialog, DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type { ReactNode } from "react";

import { ChannelLabel, PriorityBadge, RecommendationStatusBadge, RecordStatusBadge } from "./status-badges";
import type { MockAction, MockActionType, MockRecommendation, MockTimingPolicy } from "./types";

type Detail =
  | { kind: "action"; value: MockAction }
  | { kind: "action-type"; value: MockActionType }
  | { kind: "timing-policy"; value: MockTimingPolicy }
  | { kind: "recommendation"; value: MockRecommendation };

interface MockDetailDialogProps {
  detail: Detail | null;
  onClose: () => void;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-card-border bg-background-gray-secondary_alt px-3.5 py-3">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">{children}</dd>
    </div>
  );
}

function ActionDetail({ action }: { action: MockAction }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Badge color="orange">{action.actionType}</Badge>
        <Badge color={action.enabled ? "success" : "gray"}>{action.enabled ? "Đang dùng" : "Tạm dừng"}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{action.description}</p>
      <dl className="mt-5 grid gap-2 sm:grid-cols-2">
        <DetailRow label="Kênh mặc định"><ChannelLabel channel={action.channel} /></DetailRow>
        <DetailRow label="Cách thực hiện">{action.executionType === "AI_ASSISTED" ? "Có AI hỗ trợ" : "Thực hiện thủ công"}</DetailRow>
        <DetailRow label="Người được phép">{action.allowedActors.join(" · ")}</DetailRow>
        <DetailRow label="Khung giờ">{action.allowedTimeSlots.length ? action.allowedTimeSlots.join(" · ") : "Cả ngày"}</DetailRow>
        <DetailRow label="Cần duyệt trước">{action.requiresApproval ? "Có" : "Không"}</DetailRow>
        <DetailRow label="AI được phép đề xuất">{action.aiAllowed ? "Có" : "Không"}</DetailRow>
      </dl>
    </>
  );
}

function ActionTypeDetail({ actionType }: { actionType: MockActionType }) {
  return (
    <>
      <Badge color="primary">{actionType.code}</Badge>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{actionType.description}</p>
      <dl className="mt-5 grid gap-2 sm:grid-cols-2">
        <DetailRow label="Số hành động">{actionType.actionCount} hành động</DetailRow>
        <DetailRow label="Thứ tự hiển thị">{actionType.sortOrder}</DetailRow>
        <DetailRow label="Cập nhật gần nhất">{actionType.modified}</DetailRow>
        <DetailRow label="Trạng thái"><RecordStatusBadge status={actionType.status} /></DetailRow>
      </dl>
    </>
  );
}

function TimingPolicyDetail({ policy }: { policy: MockTimingPolicy }) {
  return (
    <>
      <Badge color="primary">{policy.policyKey}</Badge>
      <p className="mt-3 text-sm leading-6 text-text-secondary">Chính sách này quyết định thời điểm tạo đề xuất trong luồng minh họa.</p>
      <dl className="mt-5 grid gap-2 sm:grid-cols-2">
        <DetailRow label="Loại kích hoạt">{policy.triggerLabel}</DetailRow>
        <DetailRow label="Thời điểm xử lý">{policy.timing}</DetailRow>
        <DetailRow label="Khung giờ áp dụng">{policy.timeSlot}</DetailRow>
        <DetailRow label="Lặp lại">{policy.recurrence}</DetailRow>
        <DetailRow label="Đang dùng bởi">{policy.usedBy} quy tắc đề xuất</DetailRow>
        <DetailRow label="Trạng thái"><RecordStatusBadge status={policy.status} /></DetailRow>
      </dl>
    </>
  );
}

function RecommendationDetail({ recommendation }: { recommendation: MockRecommendation }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority={recommendation.priority} />
        <RecommendationStatusBadge status={recommendation.status} />
      </div>
      <div className="mt-4 rounded-lg border border-card-border bg-background-gray-secondary_alt p-3.5">
        <p className="font-semibold text-text-primary">{recommendation.studentName}</p>
        <p className="mt-1 font-mono text-xs text-text-tertiary">{recommendation.studentCode} · {recommendation.lifecycleStage}</p>
      </div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <DetailRow label="Hành động được đề xuất">{recommendation.actionLabel}</DetailRow>
        <DetailRow label="Kênh"><ChannelLabel channel={recommendation.channel} /></DetailRow>
        <DetailRow label="Quy tắc tạo đề xuất">{recommendation.ruleLabel}</DetailRow>
        <DetailRow label="Mức tin cậy">{recommendation.confidence}%</DetailRow>
        <DetailRow label="Tác động dự kiến">{recommendation.expectedImpact}</DetailRow>
        <DetailRow label="Hạn xử lý">{recommendation.expiresAt}</DetailRow>
      </dl>
    </>
  );
}

export default function MockDetailDialog({ detail, onClose }: MockDetailDialogProps) {
  if (!detail) return null;

  const title = detail.kind === "action" ? detail.value.displayName : detail.kind === "action-type" ? detail.value.displayName : detail.kind === "timing-policy" ? detail.value.displayName : `Đề xuất cho ${detail.value.studentName}`;
  const description = detail.kind === "action" ? `Cấu hình minh họa của hành động ${detail.value.code}` : detail.kind === "action-type" ? `Chi tiết nhóm ${detail.value.code}` : detail.kind === "timing-policy" ? `Chi tiết chính sách ${detail.value.policyKey}` : `Mã đề xuất ${detail.value.id}`;

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={title} className="max-w-140 overflow-hidden p-0">
        <DialogHeader className="gap-2 border-b border-card-border px-6 py-5 pr-14">
          <DialogTitle className="text-xl leading-7">{title}</DialogTitle>
          <DialogDescription className="text-text-tertiary">{description}</DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-5">
          {detail.kind === "action" && <ActionDetail action={detail.value} />}
          {detail.kind === "action-type" && <ActionTypeDetail actionType={detail.value} />}
          {detail.kind === "timing-policy" && <TimingPolicyDetail policy={detail.value} />}
          {detail.kind === "recommendation" && <RecommendationDetail recommendation={detail.value} />}
        </DialogBody>
        <DialogFooter className="border-t border-card-border px-6 py-4">
          <DialogClose appearance="outline" size="sm">Đóng</DialogClose>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}

export type { Detail as MockDetail };
