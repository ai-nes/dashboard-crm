"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { cn } from "@/utils/cn";
import { useState } from "react";

import {
  SEGMENT_STATUS_BADGE_COLORS,
  SEGMENT_STATUS_LABELS,
  SEGMENT_STATUS_OPTIONS,
  SEGMENT_STATUS_SELECT_STYLES,
  type SegmentStatus,
} from "./segment-list-types";

export interface SegmentCreateDetails {
  status: SegmentStatus;
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
  const [status, setStatus] = useState<SegmentStatus>("draft");
  const [description, setDescription] = useState("");
  const selectedStatus = SEGMENT_STATUS_LABELS[status];

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setStatus("draft");
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
          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="px-4 py-3">
              <p className="text-sm text-text-secondary">Trạng thái segment</p>
              <Select
                aria-label="Trạng thái segment"
                className="mt-2 gap-0"
                value={status}
                onChange={(value) => setStatus(value as SegmentStatus)}
              >
                <SelectTrigger
                  className={cn(
                    "h-10 w-full px-3 py-2 text-base font-medium",
                    SEGMENT_STATUS_SELECT_STYLES[status],
                  )}
                >
                  <SelectValue className="max-w-none text-inherit">
                    {selectedStatus}
                  </SelectValue>
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      textValue={option.label}
                    >
                      <Badge color={SEGMENT_STATUS_BADGE_COLORS[option.value]}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              onCreate({ status, description: description.trim() })
            }
          >
            Tạo segment
          </Button>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
