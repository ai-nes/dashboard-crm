"use client";

import { useLayoutEffect, useRef } from "react";

import { cn } from "@/utils/cn";

const MAX_TITLE_LINES = 7;

export interface TaskDialogTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function getLineHeight(textarea: HTMLTextAreaElement): number {
  const styles = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;

  return Number.parseFloat(styles.fontSize) * 1.2;
}

function resizeTitleTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  const maxHeight = getLineHeight(textarea) * MAX_TITLE_LINES;
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
}

export default function TaskDialogTitle({
  value,
  onChange,
  placeholder = "Tên task...",
  className,
}: TaskDialogTitleProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    resizeTitleTextarea(textarea);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const nextValue = textarea.value;
    const maxHeight = getLineHeight(textarea) * MAX_TITLE_LINES;

    if (textarea.scrollHeight > maxHeight + 1) {
      textarea.value = value;
      resizeTitleTextarea(textarea);
      return;
    }

    onChange(nextValue);
  };

  return (
    <div className={cn("w-full", className)}>
      <textarea
        ref={textareaRef}
        autoFocus
        rows={2}
        maxLength={120}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Tiêu đề task"
        className="w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-2xl font-bold leading-tight text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:font-medium placeholder:text-text-tertiary sm:text-3xl"
      />
    </div>
  );
}
