"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import {
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import type { StudentNoteItem } from "@/services/api/students/types";

interface StudentCreateNoteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onCreate: (note: StudentNoteItem) => void;
}

function isContentEmpty(html: string) {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function StudentCreateNoteSheet({
  isOpen,
  onOpenChange,
  studentName,
  onCreate,
}: StudentCreateNoteSheetProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (isContentEmpty(content)) return;

    onCreate({ author: "Bạn", date: new Date().toISOString(), content });
    toast.success(`Đã tạo ghi chú cho ${studentName}.`);
    setContent("");
    onOpenChange(false);
  };

  return (
    <SheetOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Ghi chú cho {studentName}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-3">
          <p className="text-xs text-text-tertiary">Liên kết với: {studentName}</p>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Nhập nội dung ghi chú..."
          />
        </SheetBody>
        <SheetFooter>
          <Button appearance="outline" onPress={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onPress={handleSubmit} isDisabled={isContentEmpty(content)}>
            Tạo ghi chú
          </Button>
        </SheetFooter>
      </SheetContent>
    </SheetOverlay>
  );
}
