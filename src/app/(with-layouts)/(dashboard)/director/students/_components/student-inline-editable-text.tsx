"use client";

import { Pencil1 } from "@tailgrids/icons";
import { useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { cn } from "@/utils/cn";

interface StudentInlineEditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  emptyLabel?: string;
  strikethrough?: boolean;
  textClassName?: string;
}

export default function StudentInlineEditableText({
  value,
  onCommit,
  placeholder,
  className,
  emptyLabel = "—",
  strikethrough = false,
  textClassName,
}: StudentInlineEditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!editing) return;

    const textarea =
      editorContainerRef.current?.querySelector<HTMLTextAreaElement>(
        "textarea",
      );
    if (!textarea) return;

    const resize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(textarea);

    return () => resizeObserver.disconnect();
  }, [draft, editing]);

  const commit = () => {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== value) {
      onCommit(trimmed);
    } else {
      setDraft(value);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={cn("min-w-0 flex-1 space-y-2.5", className)}>
        <div ref={editorContainerRef} className="min-w-0">
          <TextArea
            autoFocus
            maxLength={120}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit();
              if (event.key === "Escape") cancel();
            }}
            placeholder={placeholder}
            aria-label={placeholder ?? "Nội dung"}
            className="min-h-10 w-full min-w-0 resize-none overflow-hidden border-0 bg-transparent px-3 py-2 text-base font-medium shadow-none focus:border-0 focus:ring-0"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button size="xs" appearance="outline" onPress={cancel}>
            Hủy
          </Button>
          <Button size="xs" onPress={commit} isDisabled={!draft.trim()}>
            Lưu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      appearance="ghost"
      size="sm"
      onPress={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "group inline-flex h-auto min-h-8 w-full max-w-full items-start justify-start gap-1.5 rounded-lg border border-transparent px-2 py-1 text-left hover:border-card-border hover:bg-background-gray-secondary",
        className,
      )}
    >
      <span
        className={cn(
          "min-w-0 whitespace-normal break-words text-sm text-text-primary",
          textClassName,
          strikethrough && "text-text-tertiary line-through",
        )}
      >
        {value || emptyLabel}
      </span>
      <Pencil1
        size={14}
        aria-hidden="true"
        className="shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </Button>
  );
}
