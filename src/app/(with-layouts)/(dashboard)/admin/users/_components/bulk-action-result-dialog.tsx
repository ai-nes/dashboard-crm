"use client";

import { CheckCircle1, XmarkCircle } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";

export interface BulkActionResultRow {
  userName: string;
  fullName: string;
  success: boolean;
  message?: string;
}

interface BulkActionResultDialogProps {
  results: BulkActionResultRow[] | null;
  onClose: () => void;
}

export default function BulkActionResultDialog({ results, onClose }: BulkActionResultDialogProps) {
  const isOpen = results !== null;
  const successCount = results?.filter((row) => row.success).length ?? 0;
  const failureCount = (results?.length ?? 0) - successCount;

  return (
    <Backdrop isOpen={isOpen} isDismissable onOpenChange={(open) => !open && onClose()}>
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          role="alertdialog"
          aria-label="Kết quả thao tác hàng loạt"
          className="relative overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogHeader className="border-b border-card-border px-6 py-5">
            <DialogTitle>Kết quả thao tác hàng loạt</DialogTitle>
            <p className="mt-1 text-sm text-text-tertiary">
              {successCount} thành công · {failureCount} thất bại
            </p>
          </DialogHeader>
          <DialogBody className="max-h-96 space-y-2 overflow-y-auto px-6 py-5">
            {results?.map((row) => (
              <div
                key={row.userName}
                className="flex items-start gap-2.5 rounded-lg border border-card-border px-3 py-2.5"
              >
                {row.success ? (
                  <CheckCircle1 size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-success-500" />
                ) : (
                  <XmarkCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-error-500" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{row.fullName}</p>
                  {row.message ? <p className="mt-0.5 text-xs text-text-tertiary">{row.message}</p> : null}
                </div>
              </div>
            ))}
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-6 py-4">
            <Button appearance="outline" onPress={onClose}>
              Đóng
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
