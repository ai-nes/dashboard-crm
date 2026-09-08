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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  SEGMENT_TYPE_LABELS,
  type SegmentListItem,
  type SegmentType,
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
  const [type, setType] = useState<SegmentType>(segment.type);
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
                type,
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
              aria-label="Cách cập nhật segment"
              label="Cách cập nhật segment"
              value={type}
              onChange={(value) => setType(value as SegmentType)}
              className="w-full"
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEGMENT_TYPE_LABELS).map(([id, label]) => (
                  <SelectItem key={id} id={id}>
                    {label}
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
