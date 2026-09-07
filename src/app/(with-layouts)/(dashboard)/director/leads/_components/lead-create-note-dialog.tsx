"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import { Close } from "@tailgrids/icons";

interface LeadCreateNoteDialogProps {
  isOpen: boolean;
  leadName: string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (content: string) => Promise<void>;
}

function isContentEmpty(value: string): boolean {
  return value.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function LeadCreateNoteDialog({
  isOpen,
  leadName,
  isSubmitting = false,
  onOpenChange,
  onCreate,
}: LeadCreateNoteDialogProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (isContentEmpty(content)) {
      toast.error("Vui lòng nhập nội dung ghi chú.");
      return;
    }

    await onCreate(content);
    setContent("");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setContent("");
    onOpenChange(open);
  };

  return (
    <Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          aria-label={`Tạo ghi chú cho ${leadName}`}
          className="relative flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogClose
            iconOnly
            size="sm"
            variant="ghost"
            aria-label="Đóng"
            className="absolute top-4 right-4 z-10 text-text-100 opacity-70 hover:bg-transparent hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Close />
          </DialogClose>
          <DialogHeader className="border-b border-card-border px-6 py-5 pr-14">
            <DialogTitle className="text-xl leading-7">
              Ghi chú cho {leadName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-5">
            <label className="mb-1.5 block text-xs font-semibold text-text-primary">
              Nội dung ghi chú <span className="text-error-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Nhập nội dung chi tiết ghi chú..."
            />
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-6 py-4">
            <Button appearance="outline" onPress={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              onPress={() => void handleSubmit()}
              isDisabled={isSubmitting || isContentEmpty(content)}
            >
              {isSubmitting ? "Đang lưu..." : "Tạo ghi chú"}
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
