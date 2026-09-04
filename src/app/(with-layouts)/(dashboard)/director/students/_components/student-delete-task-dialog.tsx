"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type { StudentTaskItem } from "@/services/api/students/types";

interface StudentDeleteTaskDialogProps {
  task: StudentTaskItem | null;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export default function StudentDeleteTaskDialog({
  task,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: StudentDeleteTaskDialogProps) {
  if (!task) return null;

  return (
    <Backdrop
      isOpen
      isDismissable={!isDeleting}
      onOpenChange={(open) => {
        if (open || !isDeleting) onOpenChange(open);
      }}
    >
      <Dialog
        role="alertdialog"
        aria-label="Xác nhận xóa task"
        showCloseButton={false}
        className="max-w-120"
      >
        <DialogHeader>
          <DialogTitle>Xóa task này?</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Task sẽ bị xóa khỏi hồ sơ học sinh và không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="font-semibold text-text-primary">{task.title}</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose appearance="outline" isDisabled={isDeleting}>
            Hủy
          </DialogClose>
          <Button variant="danger" onPress={onConfirm} isDisabled={isDeleting}>
            {isDeleting ? "Đang xóa…" : "Xóa task"}
          </Button>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
