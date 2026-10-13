"use client";

import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import TaskDescriptionPreview from "@/components/common/task-description-preview";
import { getTaskDescriptionPreview } from "@/services/api/crm-tasks";
import { cn } from "@/utils/cn";

export interface TaskDialogDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export default function TaskDialogDescription({
  value,
  onChange,
  placeholder = "Mô tả chi tiết công việc cần làm...",
  className,
  readOnly = false,
}: TaskDialogDescriptionProps) {
  if (readOnly) {
    const hasDescription = Boolean(getTaskDescriptionPreview(value));
    return (
      <section
        aria-label="Ghi chú task"
        className={cn("flex min-h-0 flex-1 flex-col space-y-2", className)}
      >
        <h3 className="text-sm font-semibold text-text-primary">
          Ghi chú task
        </h3>
        <div className="min-h-36 whitespace-pre-wrap rounded-lg border border-card-border bg-card-background px-4 py-3 text-sm leading-6 text-text-primary">
          {hasDescription ? (
            <TaskDescriptionPreview value={value} />
          ) : (
            "Chưa có ghi chú."
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Ghi chú task"
      className={cn("flex min-h-0 flex-1 flex-col space-y-2", className)}
    >
      <h3 className="text-sm font-semibold text-text-primary">Ghi chú task</h3>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex min-h-36 flex-1 flex-col [&>div:first-child]:shrink-0 [&>div:last-child]:min-h-0 [&>div:last-child]:flex-1 [&>div:last-child>.ProseMirror]:min-h-full"
      />
    </section>
  );
}
