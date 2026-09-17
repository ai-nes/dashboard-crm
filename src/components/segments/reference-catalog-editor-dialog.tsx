"use client";

import type { FormEvent, ReactNode } from "react";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Button } from "@/components/tailgrids/core/button";

export function ReferenceCatalogEditorDialog({
  isOpen,
  title,
  description,
  isSaving,
  submitLabel,
  onOpenChange,
  onSubmit,
  children,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  isSaving: boolean;
  submitLabel: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isSaving}
      onOpenChange={(open) => {
        if (open || !isSaving) onOpenChange(open);
      }}
    >
      <Dialog
        aria-label={title}
        className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-hidden p-0"
      >
        <form onSubmit={onSubmit}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>{title}</DialogTitle>
            <p className="text-sm text-text-tertiary">{description}</p>
          </DialogHeader>
          <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
            {children}
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
              {isSaving ? "Đang lưu..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
