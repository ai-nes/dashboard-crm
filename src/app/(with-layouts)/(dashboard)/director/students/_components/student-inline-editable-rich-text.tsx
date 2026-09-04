"use client";

import { Pencil1 } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import { cn } from "@/utils/cn";

interface StudentInlineEditableRichTextProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function StudentInlineEditableRichText({
  value,
  onCommit,
  placeholder,
  className,
}: StudentInlineEditableRichTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className={cn("space-y-2", className)}>
        <RichTextEditor value={draft} onChange={setDraft} placeholder={placeholder} />
        <div className="flex justify-end gap-2">
          <Button
            size="xs"
            appearance="outline"
            onPress={() => {
              setDraft(value);
              setEditing(false);
            }}
          >
            Hủy
          </Button>
          <Button
            size="xs"
            onPress={() => {
              onCommit(draft);
              setEditing(false);
            }}
          >
            Lưu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setDraft(value);
          setEditing(true);
        }
      }}
      aria-label="Sửa nội dung"
      className={cn(
        "group relative min-h-14 cursor-text rounded-lg border border-transparent px-2 py-1.5 outline-none transition hover:border-card-border hover:bg-background-gray-secondary focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20",
        className,
      )}
    >
      <div
        className="pr-6 text-sm leading-6 text-text-primary [&_a]:text-primary-500 [&_a]:underline [&_p]:my-1"
        dangerouslySetInnerHTML={{
          __html:
            value || `<p class="text-text-tertiary">${placeholder ?? "Thêm nội dung..."}</p>`,
        }}
      />
      <Pencil1
        size={14}
        aria-hidden="true"
        className="absolute top-2 right-2 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </div>
  );
}
