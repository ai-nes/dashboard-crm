"use client";

import { Trash1 } from "@tailgrids/icons";
import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { Button, type ButtonProps } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";

interface DeleteRecordDialogProps {
  isOpen: boolean;
  recordType: string;
  recordName: string;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
}

export function DeleteRecordDialog({
  isOpen,
  recordType,
  recordName,
  isDeleting = false,
  onOpenChange,
  onConfirm,
  children,
}: DeleteRecordDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (open || !isDeleting) onOpenChange(open);
  };

  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isDeleting}
      onOpenChange={handleOpenChange}
    >
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          role="alertdialog"
          aria-label={`Xác nhận xóa ${recordType}`}
          className="relative overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogHeader className="border-b border-card-border px-6 py-5">
            <DialogTitle>Xóa {recordType} này?</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              Dữ liệu sẽ bị xóa khỏi CRM và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-2 px-6 py-5">
            <p className="break-words font-semibold text-text-primary">
              {recordName}
            </p>
            {children}
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-6 py-4">
            <Button
              appearance="outline"
              isDisabled={isDeleting}
              onPress={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              isDisabled={isDeleting}
              onPress={() => void onConfirm()}
            >
              <Trash1 size={16} aria-hidden="true" />
              {isDeleting ? "Đang xóa…" : "Xóa bản ghi"}
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}

export interface ConfirmDialogProps {
  ariaLabel: string;
  confirmAppearance?: ButtonProps["appearance"];
  confirmLabel: string;
  confirmButtonClassName?: string;
  confirmVariant?: ButtonProps["variant"];
  description?: ReactNode;
  isConfirming?: boolean;
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children?: ReactNode;
}

export function ConfirmDialog({
  ariaLabel,
  children,
  confirmAppearance = "fill",
  confirmButtonClassName,
  confirmLabel,
  confirmVariant = "primary",
  description,
  isConfirming = false,
  isOpen,
  onConfirm,
  onOpenChange,
  title,
}: ConfirmDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (open || !isConfirming) onOpenChange(open);
  };

  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isConfirming}
      onOpenChange={handleOpenChange}
    >
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          role="alertdialog"
          aria-label={ariaLabel}
          className="relative overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogHeader className="border-b border-card-border px-6 py-5">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-text-tertiary">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogBody className="space-y-2 px-6 py-5">{children}</DialogBody>
          <DialogFooter className="border-t border-card-border px-6 py-4">
            <Button
              appearance="outline"
              isDisabled={isConfirming}
              onPress={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              appearance={confirmAppearance}
              className={confirmButtonClassName}
              variant={confirmVariant}
              isDisabled={isConfirming}
              onPress={() => void onConfirm()}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
