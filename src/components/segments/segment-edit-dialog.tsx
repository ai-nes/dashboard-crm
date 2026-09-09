"use client";

import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";

import type { SegmentListItem } from "./segment-list-types";

interface SegmentEditDialogProps {
  segment: SegmentListItem;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: { title: string; purpose: string }) => Promise<void> | void;
}

export function SegmentEditDialog({
  segment,
  isSaving = false,
  onClose,
  onSave,
}: SegmentEditDialogProps) {
  const [name, setName] = useState(segment.name);
  const [purpose, setPurpose] = useState(segment.description);

  return (
    <Backdrop
      isOpen
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
      isDismissable={!isSaving}
    >
      <Dialog
        aria-label="Sửa segment"
        showCloseButton={!isSaving}
        className="overflow-hidden p-0"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) {
              void onSave({ title: name.trim(), purpose: purpose.trim() });
            }
          }}
        >
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>Sửa segment</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 px-5 py-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">
                Tên segment
              </span>
              <Input
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full text-sm"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">
                Mục đích segment
              </span>
              <TextArea
                rows={3}
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                className="w-full text-sm"
              />
            </label>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <Button
              type="button"
              appearance="outline"
              isDisabled={isSaving}
              onPress={onClose}
            >
              Hủy
            </Button>
            <Button type="submit" isDisabled={!name.trim() || isSaving}>
              {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
