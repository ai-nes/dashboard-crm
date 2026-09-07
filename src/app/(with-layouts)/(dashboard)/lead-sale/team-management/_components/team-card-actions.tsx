"use client";

import { Trash1 } from "@tailgrids/icons";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";

interface TeamCardActionsProps {
  name: string;
  kind: "đội" | "nhóm";
  onDelete: () => void;
}

export default function TeamCardActions({
  name,
  kind,
  onDelete,
}: TeamCardActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          iconOnly
          appearance="ghost"
          size="sm"
          variant="danger"
          aria-label={`Xóa ${name}`}
          onPress={() => setIsDeleting(true)}
          className="size-8 text-text-tertiary hover:bg-badge-error-background hover:text-badge-error-text"
        >
          <Trash1 size={16} aria-hidden="true" />
        </Button>
      </div>
      {isDeleting && (
        <Backdrop isOpen onOpenChange={(open) => !open && setIsDeleting(false)}>
          <Dialog
            role="alertdialog"
            aria-label={`Xóa ${kind}`}
            className="max-w-100 p-0"
          >
            <DialogBody className="space-y-3 p-5">
              <DialogTitle>
                Xóa {kind} “{name}”?
              </DialogTitle>
              <p className="text-sm leading-6 text-text-secondary">
                {kind === "đội"
                  ? "Các nhóm trực thuộc cũng sẽ bị xóa. Thành viên được đưa về danh sách chưa phân nhóm."
                  : "Thành viên được đưa về danh sách chưa phân nhóm."}{" "}
                Tài khoản nhân sự vẫn được giữ lại.
              </p>
            </DialogBody>
            <DialogFooter className="px-5 pb-5">
              <Button
                appearance="outline"
                autoFocus
                onPress={() => setIsDeleting(false)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  setIsDeleting(false);
                  onDelete();
                }}
              >
                Xóa {kind}
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}
    </>
  );
}
