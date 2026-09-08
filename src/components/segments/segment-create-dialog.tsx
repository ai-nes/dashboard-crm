"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { cn } from "@/utils/cn";
import { useState } from "react";

export type SegmentRefreshMode = "AUTOMATIC" | "MANUAL";

export interface SegmentCreateDetails {
  refreshMode: SegmentRefreshMode;
  description: string;
}

interface SegmentCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  segmentName: string;
  studentSize: number;
  onCreate: (details: SegmentCreateDetails) => void;
}

export function SegmentCreateDialog({
  isOpen,
  onOpenChange,
  segmentName,
  studentSize,
  onCreate,
}: SegmentCreateDialogProps) {
  const [refreshMode, setRefreshMode] =
    useState<SegmentRefreshMode>("AUTOMATIC");
  const [description, setDescription] = useState("");

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setRefreshMode("AUTOMATIC");
      setDescription("");
    }
    onOpenChange(nextIsOpen);
  };

  return (
    <Backdrop isOpen={isOpen} onOpenChange={handleOpenChange} isDismissable>
      <Dialog
        aria-label="Tạo segment"
        showCloseButton
        className="max-w-140 overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-card-border px-5 py-4 pr-14">
          <DialogTitle className="text-xl leading-7">Tạo segment</DialogTitle>
          <p className="truncate text-sm text-text-secondary">{segmentName}</p>
        </DialogHeader>

        <DialogBody className="space-y-5 px-5 py-5">
          <div className="rounded-xl border border-badge-sky-icon-color/30 bg-badge-sky-background/60 px-4 py-3">
            <p className="text-sm text-text-secondary">
              Số học sinh trong segment
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-3xl leading-9 text-text-primary">
                {studentSize.toLocaleString("vi-VN")}
              </strong>
              <span className="text-sm text-text-secondary">học sinh</span>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-input-label-text-color">
              Cách cập nhật segment
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="primary"
                appearance="outline"
                aria-pressed={refreshMode === "AUTOMATIC"}
                className={cn(
                  "h-auto min-h-20 flex-col items-start gap-1 px-4 py-3 text-left",
                  refreshMode === "AUTOMATIC" &&
                    "border-button-primary-background bg-badge-primary-background text-text-primary hover:bg-badge-primary-background",
                )}
                onPress={() => setRefreshMode("AUTOMATIC")}
              >
                <span className="font-semibold">Tự động</span>
                <span className="text-xs font-normal opacity-80">
                  Tự cập nhật khi học sinh thay đổi dữ liệu.
                </span>
              </Button>
              <Button
                type="button"
                variant="primary"
                appearance="outline"
                aria-pressed={refreshMode === "MANUAL"}
                className={cn(
                  "h-auto min-h-20 flex-col items-start gap-1 px-4 py-3 text-left",
                  refreshMode === "MANUAL" &&
                    "border-button-primary-background bg-badge-primary-background text-text-primary hover:bg-badge-primary-background",
                )}
                onPress={() => setRefreshMode("MANUAL")}
              >
                <span className="font-semibold">Thủ công</span>
                <span className="text-xs font-normal opacity-80">
                  Chỉ cập nhật khi bạn thực hiện thủ công.
                </span>
              </Button>
            </div>
          </fieldset>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-input-label-text-color">
              Mô tả
            </span>
            <TextArea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Nhập mô tả ngắn cho segment"
              className="px-3 py-2.5 text-sm"
            />
          </label>
        </DialogBody>

        <DialogFooter className="border-t border-card-border px-5 py-3">
          <Button
            variant="primary"
            appearance="outline"
            onPress={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            appearance="fill"
            onPress={() =>
              onCreate({ refreshMode, description: description.trim() })
            }
          >
            Tạo segment
          </Button>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
