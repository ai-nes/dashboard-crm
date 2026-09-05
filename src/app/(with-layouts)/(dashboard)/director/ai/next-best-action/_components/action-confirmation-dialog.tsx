"use client";

import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";

import type { RecommendedAction } from "./types";

export type ActionConfirmationType = "defer" | "dismiss";

interface ActionConfirmationDialogProps {
  action: RecommendedAction | null;
  type: ActionConfirmationType | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const dialogCopy = {
  defer: {
    title: "Trì hoãn việc này",
    description: "Việc sẽ được đưa ra khỏi danh sách hiện tại để xử lý sau.",
    confirmLabel: "Trì hoãn",
  },
  dismiss: {
    title: "Bỏ đề xuất này",
    description: "Đề xuất sẽ không còn xuất hiện trong danh sách cần xử lý.",
    confirmLabel: "Bỏ đề xuất",
  },
} as const;

export default function ActionConfirmationDialog({ action, type, onClose, onConfirm }: ActionConfirmationDialogProps) {
  if (!action || !type) return null;

  const copy = dialogCopy[type];

  return (
    <Dialog isOpen onOpenChange={(isOpen) => !isOpen && onClose()} className="max-w-120">
      <DialogHeader>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription className="text-text-tertiary">{copy.description}</DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-2">
        <p className="font-medium text-text-primary">{action.recommendation}</p>
        <p>{action.studentName} · {action.school}</p>
      </DialogBody>
      <DialogFooter>
        <Button appearance="outline" onPress={onClose}>Để sau</Button>
        <Button onPress={onConfirm}>{copy.confirmLabel}</Button>
      </DialogFooter>
    </Dialog>
  );
}
