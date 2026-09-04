"use client";

import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type {
  NbaDecisionOperation,
  NbaRecommendation,
} from "@/services/api/nba";

import StudentNbaDecisionForm from "./student-nba-decision-form";
import {
  actionLabel,
  formatNbaChannel,
  NBA_PRIORITY_LABELS,
  type DecisionFields,
} from "./student-nba-ui";

interface StudentNbaDecisionDialogProps {
  recommendation: NbaRecommendation;
  operation: NbaDecisionOperation;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (fields: DecisionFields) => Promise<void>;
}

const DIALOG_COPY: Record<
  NbaDecisionOperation,
  { title: string; description: string }
> = {
  ACCEPT: {
    title: "Chấp nhận đề xuất",
    description:
      "Xác nhận để ghi nhận quyết định và tạo Task cho người phụ trách.",
  },
  ACCEPT_WITH_CHANGES: {
    title: "Chấp nhận có chỉnh sửa",
    description: "Điều chỉnh thông tin cần thiết trước khi tạo Task.",
  },
  REJECT: {
    title: "Từ chối đề xuất",
    description: "Cho biết lý do để lưu lại đầy đủ lịch sử quyết định.",
  },
  DEFER: {
    title: "Trì hoãn đề xuất",
    description: "Chọn thời điểm để xem lại đề xuất này trong tương lai.",
  },
  DISMISS: {
    title: "Bỏ qua đề xuất",
    description: "Đề xuất sẽ được loại khỏi danh sách cần xử lý.",
  },
};

export default function StudentNbaDecisionDialog({
  recommendation,
  operation,
  isSubmitting,
  onClose,
  onSubmit,
}: StudentNbaDecisionDialogProps) {
  const copy = DIALOG_COPY[operation];
  const studentName = recommendation.studentName?.trim() || "Học sinh";

  return (
    <Backdrop
      isOpen
      isDismissable={!isSubmitting}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) onClose();
      }}
    >
      <Dialog
        aria-label={copy.title}
        showCloseButton={!isSubmitting}
        className="flex max-h-[calc(100vh-2rem)] max-w-140 flex-col overflow-hidden p-0 max-sm:max-w-[calc(100%-2rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 pr-14">
          <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-300">
            Ghi nhận quyết định
          </p>
          <DialogTitle className="mt-1 text-xl leading-7">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-text-tertiary">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section
            aria-label="Thông tin đề xuất"
            className="rounded-lg border border-card-border bg-background-soft-50 p-4"
          >
            <p className="text-xs font-semibold text-text-tertiary">Đề xuất</p>
            <p className="mt-1.5 text-sm leading-5 font-semibold text-text-primary">
              {actionLabel(recommendation.actionId)}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary">
              <span>{studentName}</span>
              <span>{formatNbaChannel(recommendation.channel)}</span>
              <span>{NBA_PRIORITY_LABELS[recommendation.priority]}</span>
            </div>
          </section>

          <StudentNbaDecisionForm
            key={`${recommendation.id}-${operation}`}
            recommendation={recommendation}
            operation={operation}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        </DialogBody>
      </Dialog>
    </Backdrop>
  );
}
