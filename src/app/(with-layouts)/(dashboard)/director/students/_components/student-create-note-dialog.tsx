"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import { Close } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";
import type { StudentNoteItem } from "@/services/api/students/types";

interface StudentCreateNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onCreate: (note: StudentNoteItem) => void;
  isSubmitting?: boolean;
}

function isContentEmpty(value: string) {
  return value.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function StudentCreateNoteDialog({
  isOpen,
  onOpenChange,
  studentName,
  onCreate,
  isSubmitting = false,
}: StudentCreateNoteDialogProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (isContentEmpty(content)) {
      toast.error("Vui lòng nhập nội dung ghi chú.");
      return;
    }

    onCreate({
      author: "Bạn",
      date: new Date().toISOString(),
      content,
    });
    toast.success(`Đã tạo ghi chú cho ${studentName}.`);
    setContent("");
    onOpenChange(false);
  };

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={onOpenChange}>
      <Backdrop>
        <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] data-entering:scale-95 data-entering:opacity-0 data-exiting:scale-95 data-exiting:opacity-0 motion-reduce:transition-none motion-reduce:data-entering:scale-100 motion-reduce:data-entering:opacity-100 motion-reduce:data-exiting:scale-100 motion-reduce:data-exiting:opacity-100 max-sm:max-w-[calc(100%-2rem)]">
          <AriaDialog
            aria-label={`Tạo ghi chú cho ${studentName}`}
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
                Ghi chú cho {studentName}
              </DialogTitle>
              <DialogDescription className="text-text-tertiary">
                Liên kết với hồ sơ tuyển sinh của {studentName}
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-primary">
                  Nội dung ghi chú <span className="text-error-500">*</span>
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Nhập nội dung chi tiết ghi chú..."
                />
              </div>
            </DialogBody>
            <DialogFooter className="border-t border-card-border px-6 py-4">
              <Button appearance="outline" onPress={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                onPress={handleSubmit}
                isDisabled={isContentEmpty(content) || isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Tạo ghi chú"}
              </Button>
            </DialogFooter>
          </AriaDialog>
        </AriaModal>
      </Backdrop>
    </OverlayWrapper>
  );
}
