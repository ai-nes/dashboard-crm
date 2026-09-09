"use client";

import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
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

import {
  SEGMENT_STATUS_BADGE_COLORS,
  SEGMENT_STATUS_LABELS,
  SEGMENT_STATUS_SELECT_STYLES,
  type SegmentStatus,
} from "./segment-list-types";

export interface SegmentCreateDetails {
  status: Extract<SegmentStatus, "draft" | "active">;
  purpose: string;
  category: "admission_stage" | "potential" | "intent" | "need";
}

const CREATE_STATUS_OPTIONS: Array<{
  value: SegmentCreateDetails["status"];
  label: string;
}> = [
  { value: "draft", label: SEGMENT_STATUS_LABELS.draft },
  { value: "active", label: SEGMENT_STATUS_LABELS.active },
];

const CATEGORY_OPTIONS: Array<{
  value: SegmentCreateDetails["category"];
  label: string;
}> = [
  { value: "admission_stage", label: "Giai đoạn tuyển sinh" },
  { value: "potential", label: "Tiềm năng" },
  { value: "intent", label: "Ý định" },
  { value: "need", label: "Nhu cầu" },
];

interface SegmentCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  segmentName: string;
  studentSize: number;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  initialStatus?: SegmentCreateDetails["status"];
  initialPurpose?: string;
  initialCategory?: SegmentCreateDetails["category"];
  statusLabel?: string;
  currentStatus?: SegmentStatus;
  onCreate: (details: SegmentCreateDetails) => Promise<void> | void;
}

export function SegmentCreateDialog({
  isOpen,
  onOpenChange,
  segmentName,
  studentSize,
  isSubmitting = false,
  mode = "create",
  initialStatus = "draft",
  initialPurpose = "",
  initialCategory = "potential",
  statusLabel,
  currentStatus,
  onCreate,
}: SegmentCreateDialogProps) {
  const [status, setStatus] =
    useState<SegmentCreateDetails["status"]>(initialStatus);
  const [purpose, setPurpose] = useState(initialPurpose);
  const [category, setCategory] =
    useState<SegmentCreateDetails["category"]>(initialCategory);
  const isEditMode = mode === "edit";
  const statusStyle = SEGMENT_STATUS_SELECT_STYLES[currentStatus ?? status];

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen && !isSubmitting) {
      setStatus(initialStatus);
      setPurpose(initialPurpose);
      setCategory(initialCategory);
    }
    onOpenChange(nextIsOpen);
  };

  const canCreate =
    !isSubmitting &&
    Boolean(segmentName.trim()) &&
    (isEditMode ||
      status === "draft" ||
      (Boolean(purpose.trim()) && Boolean(category)));

  return (
    <Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={!isSubmitting}
    >
      <Dialog
        aria-label={isEditMode ? "Chỉnh sửa segment" : "Tạo segment"}
        showCloseButton={!isSubmitting}
        className="max-w-140 overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-card-border px-5 py-4 pr-14">
          <DialogTitle className="text-xl leading-7">
            {isEditMode ? "Chỉnh sửa segment" : "Tạo segment"}
          </DialogTitle>
          <p className="truncate text-sm text-text-secondary">{segmentName}</p>
        </DialogHeader>

        <DialogBody className="space-y-5 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-badge-sky-icon-color/30 bg-badge-sky-background/60 px-4 py-3">
              <p className="text-sm text-text-secondary">
                Số học sinh khớp bộ lọc
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="text-3xl leading-9 text-text-primary">
                  {studentSize.toLocaleString("vi-VN")}
                </strong>
                <span className="text-sm text-text-secondary">học sinh</span>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm text-text-secondary">
                {isEditMode ? "Trạng thái hiện tại" : "Trạng thái ban đầu"}
              </p>
              {isEditMode ? (
                <div
                  className={cn(
                    "mt-2 flex h-10 items-center rounded-lg border px-3 text-base font-medium",
                    statusStyle,
                  )}
                >
                  {statusLabel ?? SEGMENT_STATUS_LABELS[status]}
                </div>
              ) : (
                <Select
                  aria-label="Trạng thái ban đầu"
                  className="mt-2 gap-0"
                  value={status}
                  onChange={(value) =>
                    setStatus(value as SegmentCreateDetails["status"])
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-10 w-full px-3 py-2 text-base font-medium",
                      SEGMENT_STATUS_SELECT_STYLES[status],
                    )}
                  >
                    <SelectValue className="max-w-none text-inherit">
                      {SEGMENT_STATUS_LABELS[status]}
                    </SelectValue>
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATE_STATUS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        id={option.value}
                        textValue={option.label}
                      >
                        <Badge
                          color={SEGMENT_STATUS_BADGE_COLORS[option.value]}
                        >
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Select
            aria-label="Nhóm nghiệp vụ"
            label="Nhóm nghiệp vụ"
            value={category}
            onChange={(value) =>
              setCategory(value as SegmentCreateDetails["category"])
            }
            className="w-full"
          >
            <SelectTrigger className="w-full text-base">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
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

          <label className="block space-y-2">
            <span className="text-sm font-medium text-input-label-text-color">
              Mục đích segment
            </span>
            <TextArea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              rows={3}
              placeholder="Nhập mục đích sử dụng segment"
              className="px-3 py-2.5 text-sm"
            />
          </label>
        </DialogBody>

        <DialogFooter className="border-t border-card-border px-5 py-3">
          <Button
            variant="primary"
            appearance="outline"
            isDisabled={isSubmitting}
            onPress={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            appearance="fill"
            isDisabled={!canCreate}
            onPress={() =>
              onCreate({ status, purpose: purpose.trim(), category })
            }
          >
            {isSubmitting
              ? "Đang lưu…"
              : isEditMode
                ? "Lưu thay đổi"
                : "Tạo segment"}
          </Button>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
