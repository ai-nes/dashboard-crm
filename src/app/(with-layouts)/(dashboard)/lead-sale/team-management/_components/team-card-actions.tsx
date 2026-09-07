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
  isDisabled?: boolean;
}

export default function TeamCardActions({
  name,
  kind,
  onDelete,
  isDisabled = false,
}: TeamCardActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  if (isDisabled) return null;
  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          iconOnly
          appearance="ghost"
          size="sm"
          variant="danger"
          aria-label={`Ngừng hoạt động ${name}`}
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
            aria-label={`Ngừng hoạt động ${kind}`}
            className="max-w-100 p-0"
          >
            <DialogBody className="space-y-3 p-5">
              <DialogTitle>
                Ngừng hoạt động {kind} “{name}”?
              </DialogTitle>
              <p className="text-sm leading-6 text-text-secondary">
                {kind === "đội"
                  ? "Các nhóm trực thuộc vẫn được giữ lại. Thành viên và dữ liệu không bị xóa."
                  : "Thành viên và dữ liệu không bị xóa."}{" "}
                Người dùng vẫn giữ nguyên tài khoản.
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
                Ngừng hoạt động
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}
    </>
  );
}
