"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import { Close } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";
import type { StudentNoteItem } from "@/services/api/students/types";
import {
  dueDateQuickOptions,
  getDateInputValue,
} from "./student-due-date-options";
import type { StudentNoteCreationOptions } from "./types";

interface StudentCreateNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onCreate: (
    note: StudentNoteItem,
    options: StudentNoteCreationOptions,
  ) => Promise<void>;
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
  const [createFollowUpTask, setCreateFollowUpTask] = useState(false);
  const [isCustomFollowUpDate, setIsCustomFollowUpDate] = useState(false);
  const [followUpDueDate, setFollowUpDueDate] = useState(() =>
    getDateInputValue(1),
  );

  const handleFollowUpChange = (isSelected: boolean) => {
    setCreateFollowUpTask(isSelected);
    if (!isSelected) {
      setIsCustomFollowUpDate(false);
    }
    if (isSelected && !followUpDueDate) {
      setIsCustomFollowUpDate(false);
      setFollowUpDueDate(getDateInputValue(1));
    }
  };

  const handleQuickFollowUpDate = (daysFromNow: number) => {
    setIsCustomFollowUpDate(false);
    setFollowUpDueDate(getDateInputValue(daysFromNow));
  };

  const handleCustomFollowUpDate = () => {
    setIsCustomFollowUpDate(true);
    setFollowUpDueDate("");
  };

  const handleSubmit = async () => {
    if (isContentEmpty(content)) {
      toast.error("Vui lòng nhập nội dung ghi chú.");
      return;
    }

    await onCreate(
      {
        author: "Bạn",
        date: new Date().toISOString(),
        content,
      },
      { createFollowUpTask, followUpDueDate },
    );
    toast.success(`Đã tạo ghi chú cho ${studentName}.`);
    setContent("");
    setCreateFollowUpTask(false);
    setIsCustomFollowUpDate(false);
    setFollowUpDueDate(getDateInputValue(1));
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
              <Checkbox
                isSelected={createFollowUpTask}
                onChange={handleFollowUpChange}
                className="w-full rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 py-2.5 text-left text-sm text-text-primary transition hover:bg-background-gray-secondary"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    Tạo task follow-up theo ghi chú này
                  </span>
                  <span className="text-xs text-text-tertiary">
                    Tạo task “Cần làm”, giao cho bạn và đặt hạn follow-up
                  </span>
                </span>
              </Checkbox>
              {createFollowUpTask && (
                <div className="rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 py-2.5">
                  <span className="mb-2 block text-xs font-medium text-text-primary">
                    Hạn task follow-up
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dueDateQuickOptions.map((option) => {
                      const optionDate = getDateInputValue(option.daysFromNow);
                      const isSelected = followUpDueDate === optionDate;

                      return (
                        <Button
                          key={option.daysFromNow}
                          type="button"
                          size="xs"
                          variant="primary"
                          appearance="outline"
                          aria-pressed={isSelected}
                          onPress={() =>
                            handleQuickFollowUpDate(option.daysFromNow)
                          }
                          className={
                            isSelected
                              ? "border-input-primary-focus-border bg-background-white-primary text-text-primary"
                              : "text-text-secondary"
                          }
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                    <Button
                      type="button"
                      size="xs"
                      variant="primary"
                      appearance="outline"
                      aria-pressed={isCustomFollowUpDate}
                      onPress={handleCustomFollowUpDate}
                      className={
                        isCustomFollowUpDate
                          ? "border-input-primary-focus-border bg-background-white-primary text-text-primary"
                          : "text-text-secondary"
                      }
                    >
                      Tùy chọn
                    </Button>
                  </div>
                  {isCustomFollowUpDate && (
                    <Input
                      type="date"
                      value={followUpDueDate}
                      min={getDateInputValue(0)}
                      onChange={(event) =>
                        setFollowUpDueDate(event.target.value)
                      }
                      aria-label="Chọn ngày follow-up tùy chọn"
                      className="mt-2 h-9 max-w-52 bg-background-white-primary"
                    />
                  )}
                </div>
              )}
            </DialogBody>
            <DialogFooter className="border-t border-card-border px-6 py-4">
              <Button appearance="outline" onPress={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                onPress={handleSubmit}
                isDisabled={
                  isContentEmpty(content) ||
                  isSubmitting ||
                  (createFollowUpTask &&
                    isCustomFollowUpDate &&
                    !followUpDueDate)
                }
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
