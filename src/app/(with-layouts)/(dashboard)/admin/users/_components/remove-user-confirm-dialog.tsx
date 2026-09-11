"use client";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";

interface RemoveUserConfirmDialogProps {
  isOpen: boolean;
  /** Display label for the confirm copy, e.g. a user's full name or "3 người dùng". */
  targetLabel: string;
  isRemoving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export default function RemoveUserConfirmDialog({
  isOpen,
  targetLabel,
  isRemoving,
  onOpenChange,
  onConfirm,
}: RemoveUserConfirmDialogProps) {
  return (
    <ConfirmDialog
      ariaLabel={`Xác nhận gỡ quyền CRM của ${targetLabel}`}
      title={`Gỡ quyền CRM của ${targetLabel}?`}
      description="Người dùng sẽ mất toàn bộ vai trò CRM và không thể truy cập hệ thống cho đến khi được cấp lại."
      confirmLabel={isRemoving ? "Đang gỡ…" : "Gỡ khỏi CRM"}
      confirmVariant="danger"
      isOpen={isOpen}
      isConfirming={isRemoving}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
