"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import type { StudentWorklistItem } from "@/services/api/student-worklist";

interface StudentCompleteActionDialogProps {
  action: StudentWorklistItem | null;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onConfirm: (input: {
    outcomeCode: string;
    outcomeNotes?: string;
  }) => Promise<void>;
}

export default function StudentCompleteActionDialog({
  action,
  onOpenChange,
  isSubmitting = false,
  onConfirm,
}: StudentCompleteActionDialogProps) {
  const [outcomeCode, setOutcomeCode] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  if (!action) return null;

  const handleClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setOutcomeCode(null);
      setNotes("");
    }
    onOpenChange(open);
  };

  const handleConfirm = async () => {
    if (!outcomeCode) return;
    try {
      await onConfirm({
        outcomeCode,
        outcomeNotes: notes.trim() || undefined,
      });
      toast.success("Đã ghi nhận kết quả công việc.");
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể ghi nhận kết quả công việc.",
      );
    }
  };

  const selectedOption = action.outcomeCodes.find(
    (option) => option.value === outcomeCode,
  );

  return (
    <Backdrop isOpen isDismissable={!isSubmitting} onOpenChange={handleClose}>
      <Dialog
        aria-label="Hoàn tất công việc"
        showCloseButton={false}
        className="max-w-140"
      >
        <DialogHeader>
          <DialogTitle>Hoàn tất công việc</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            {action.objective}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="space-y-2">
            <Label>Kết quả</Label>
            <Select
              value={outcomeCode ?? undefined}
              onChange={(value) => setOutcomeCode(String(value))}
              isDisabled={isSubmitting || action.outcomeCodes.length === 0}
              aria-label="Chọn kết quả"
            >
              <SelectTrigger size="md" className="w-full">
                <SelectValue>
                  {selectedOption?.label ??
                    (action.outcomeCodes.length === 0
                      ? "Không có kết quả phù hợp"
                      : "Chọn kết quả…")}
                </SelectValue>
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {action.outcomeCodes.map((option) => (
                  <SelectItem
                    key={option.value}
                    id={option.value}
                    textValue={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complete-action-notes">Ghi chú</Label>
            <TextArea
              id="complete-action-notes"
              rows={3}
              placeholder="Ghi chú thêm về kết quả (không bắt buộc)"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose appearance="outline" isDisabled={isSubmitting}>
            Hủy
          </DialogClose>
          <Button
            variant="primary"
            onPress={handleConfirm}
            isDisabled={!outcomeCode || isSubmitting}
          >
            {isSubmitting ? "Đang xác nhận…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
