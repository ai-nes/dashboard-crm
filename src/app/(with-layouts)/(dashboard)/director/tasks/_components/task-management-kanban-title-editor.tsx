"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Pencil1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { TextArea } from "@/components/tailgrids/core/text-area";

interface TaskManagementKanbanTitleEditorProps {
  title: string;
  onSave: (title: string) => void | Promise<void>;
}

export default function TaskManagementKanbanTitleEditor({
  title,
  onSave,
}: TaskManagementKanbanTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
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
  }, [draft, isEditing]);

  const startEditing = () => {
    setDraft(title);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(title);
    setIsEditing(false);
  };

  const saveTitle = async () => {
    const nextTitle = draft.trim();
    if (!nextTitle || nextTitle === title) {
      cancelEditing();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nextTitle);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveTitle();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div
      className="group/title relative mt-3 min-w-0"
      onClick={(event) => event.stopPropagation()}
    >
      {isEditing ? (
        <>
          <div ref={editorContainerRef} className="min-w-0">
            <TextArea
              aria-label="Tiêu đề task"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              autoFocus
              rows={2}
              maxLength={120}
              className="min-h-10 resize-none overflow-hidden rounded-md border-0 bg-transparent px-0 py-0 text-sm leading-5 font-semibold shadow-none outline-none focus:border-0 focus:ring-0"
            />
          </div>
          <div className="mt-1 flex justify-end gap-1">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              appearance="ghost"
              onPress={cancelEditing}
              isDisabled={isSaving}
              className="h-7 px-2 text-xs text-text-tertiary"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="xs"
              variant="primary"
              appearance="ghost"
              onPress={() => void saveTitle()}
              isDisabled={isSaving}
              className="h-7 px-2 text-xs"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="break-words pr-8 text-sm font-semibold leading-5 text-text-primary">
            {title}
          </h3>
          <Button
            type="button"
            iconOnly
            size="xs"
            variant="ghost"
            appearance="ghost"
            aria-label="Chỉnh sửa tiêu đề task"
            onPress={startEditing}
            className="absolute top-0 right-0 size-6 rounded-md text-text-tertiary opacity-0 hover:bg-background-soft-50 hover:text-text-primary group-hover/title:opacity-100 focus-visible:opacity-100"
          >
            <Pencil1 size={13} aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  );
}
