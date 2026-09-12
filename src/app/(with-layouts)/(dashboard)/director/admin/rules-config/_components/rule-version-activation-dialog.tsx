"use client";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";

interface RuleVersionActivationDialogProps {
  isOpen: boolean;
  isConfirming: boolean;
  versionName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function RuleVersionActivationDialog({
  isOpen,
  isConfirming,
  versionName,
  onOpenChange,
  onConfirm,
}: RuleVersionActivationDialogProps) {
  return (
    <ConfirmDialog
      ariaLabel="Xác nhận kích hoạt Version"
      title="Kích hoạt Version này?"
      description={
        <>
          Version <strong>{versionName}</strong> sẽ có hiệu lực ngay. Version
          Active cũ (nếu có) sẽ tự động chuyển sang Đã lưu trữ; sau khi kích
          hoạt, hệ thống luôn giữ đúng một Version Active.
        </>
      }
      confirmLabel={isConfirming ? "Đang kích hoạt…" : "Kích hoạt Version"}
      isConfirming={isConfirming}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
