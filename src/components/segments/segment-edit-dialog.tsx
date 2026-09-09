"use client";

import { useState } from "react";
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
import { Input } from "@/components/tailgrids/core/input";
import { cn } from "@/utils/cn";
import { TextArea } from "@/components/tailgrids/core/text-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  SEGMENT_STATUS_BADGE_COLORS,
  SEGMENT_STATUS_LABELS,
  SEGMENT_STATUS_OPTIONS,
  SEGMENT_STATUS_SELECT_STYLES,
  type SegmentListItem,
  type SegmentStatus,
} from "./segment-list-types";

interface SegmentEditDialogProps {
  segment: SegmentListItem;
  onClose: () => void;
  onSave: (segment: SegmentListItem) => void;
}

export function SegmentEditDialog({
  segment,
  onClose,
  onSave,
}: SegmentEditDialogProps) {
  const [name, setName] = useState(segment.name);
  const [status, setStatus] = useState<SegmentStatus>(segment.status);
  const [description, setDescription] = useState(segment.description);
  return (
    <Backdrop
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
    >
      <Dialog aria-label="Sửa segment" className="overflow-hidden p-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim())
              onSave({
                ...segment,
                name: name.trim(),
                status,
                description: description.trim(),
                updatedAt: new Date().toISOString(),
              });
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
            <Select
              aria-label="Trạng thái segment"
              label="Trạng thái segment"
              value={status}
              onChange={(value) => setStatus(value as SegmentStatus)}
              className="w-full"
            >
              <SelectTrigger
                className={cn(
                  "w-full text-base font-medium",
                  SEGMENT_STATUS_SELECT_STYLES[status],
                )}
              >
                <SelectValue className="max-w-none text-inherit">
                  {SEGMENT_STATUS_LABELS[status]}
                </SelectValue>
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
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">
                Mô tả
              </span>
              <TextArea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full text-sm"
              />
            </label>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <Button appearance="outline" onPress={onClose}>
              Hủy
            </Button>
            <Button type="submit" isDisabled={!name.trim()}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
