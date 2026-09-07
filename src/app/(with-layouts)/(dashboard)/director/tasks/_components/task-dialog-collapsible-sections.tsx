"use client";

import {
  ChevronDown,
  ChevronRight,
  Paperclip2,
  Plus,
} from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}
export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
}

export interface TaskDialogCollapsibleSectionsProps {
  userInitials?: string;
  className?: string;
}

export function AttachmentsSection({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const handleAddAttachment = () => {
    const newFile: AttachmentItem = {
      id: `file-${Date.now()}`,
      name: `Tài liệu đính kèm_${attachments.length + 1}.pdf`,
      size: "1.2 MB",
    };
    setAttachments((prev) => [...prev, newFile]);
    toast.success("Đã thêm tệp đính kèm.");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold text-text-primary hover:text-primary-600"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>Attachments</span>
        {attachments.length > 0 && (
          <span className="ml-1 text-xs font-normal text-text-tertiary">
            ({attachments.length})
          </span>
        )}
      </button>

      {isOpen && (
        <div className="space-y-2">
          {/* Dashed dropzone chuẩn Jira */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-card-border bg-background-soft-50/40 p-5 text-center transition-colors hover:bg-background-soft-50">
            <Button
              appearance="outline"
              size="sm"
              onPress={handleAddAttachment}
              className="flex items-center gap-2 rounded-md border-card-border bg-card-background px-3 py-1.5 text-xs font-semibold text-text-primary shadow-xs hover:bg-background-soft-100"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-badge-purple-background text-badge-purple-text">
                <Paperclip2 size={12} />
              </span>
              <span>Add attachment</span>
            </Button>
          </div>

          {/* Danh sách file đính kèm */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-md border border-card-border bg-card-background p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip2 size={14} className="shrink-0 text-text-tertiary" />
                    <span className="truncate font-medium text-text-primary">{file.name}</span>
                  </div>
                  <span className="shrink-0 text-text-tertiary">{file.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SubtasksSection({ className }: { className?: string }) {
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAddSubtask = () => {
    if (!newTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newTitle.trim(), completed: false },
    ]);
    setNewTitle("");
    setIsAdding(false);
    toast.success("Đã thêm task con.");
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-text-primary">Subtasks</h3>

      {subtasks.length > 0 && (
        <div className="space-y-1">
          {subtasks.map((st) => (
            <label
              key={st.id}
              className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-background-soft-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={st.completed}
                onChange={() => toggleSubtask(st.id)}
                className="size-4 rounded border-card-border text-primary-600 focus:ring-primary-500"
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  st.completed ? "line-through text-text-tertiary" : "text-text-primary",
                )}
              >
                {st.title}
              </span>
            </label>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") setIsAdding(false);
            }}
            placeholder="Nội dung task con..."
            className="h-8 flex-1 rounded border border-card-border bg-input-background px-2.5 text-xs text-text-primary focus:border-primary-500 focus:outline-none"
          />
          <Button size="xs" onPress={handleAddSubtask} className="h-8 text-xs">
            Thêm
          </Button>
          <Button
            appearance="ghost"
            variant="ghost"
            size="xs"
            onPress={() => setIsAdding(false)}
            className="h-8 text-xs text-text-secondary"
          >
            Hủy
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          <Plus size={14} />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
}

export function LinkedWorkItemsSection({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-text-primary">Linked work items</h3>
      <button
        type="button"
        onClick={() => toast.info("Tính năng liên kết task đang được kích hoạt.")}
        className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
      >
        <Plus size={14} />
        <span>Add linked work item</span>
      </button>
    </div>
  );
}

export function ActivitySection({
  userInitials = "TP",
  className,
}: {
  userInitials?: string;
  className?: string;
}) {
  const [comment, setComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [commentsList, setCommentsList] = useState<string[]>([]);

  const handlePostComment = () => {
    if (!comment.trim()) return;
    setCommentsList((prev) => [...prev, comment.trim()]);
    setComment("");
    setIsFocused(false);
    toast.success("Đã đăng bình luận.");
  };

  const handleQuickChip = (text: string) => {
    setComment(text);
    setIsFocused(true);
  };

  return (
    <div className={cn("space-y-3 pt-2", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Activity</h3>
      </div>

      {/* Danh sách comment đã đăng */}
      {commentsList.length > 0 && (
        <div className="space-y-2">
          {commentsList.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-card-border p-3 text-xs">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white-100">
                {userInitials}
              </span>
              <div className="space-y-1">
                <span className="font-semibold text-text-primary">Bạn</span>
                <p className="text-text-secondary">{item}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Khung bình luận chuẩn Jira */}
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white-100">
          {userInitials}
        </span>

        <div className="flex-1 space-y-2">
          <div
            className={cn(
              "overflow-hidden rounded-lg border bg-background-white-primary transition-all duration-150",
              isFocused ? "border-primary-500 ring-2 ring-primary-500/10" : "border-card-border",
            )}
          >
            <textarea
              rows={isFocused ? 3 : 1}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Add a comment..."
              className="w-full resize-none bg-transparent px-3 py-2 text-xs text-text-primary outline-none placeholder:text-text-tertiary"
            />

            {/* Quick suggestion chips */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-card-border/60 bg-background-soft-50/50 px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => handleQuickChip("Who is working on this...?")}
                className="rounded-full border border-card-border bg-card-background px-2.5 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-background-soft-100 hover:text-text-primary"
              >
                Who is working on this...?
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip("Can I get more info...?")}
                className="rounded-full border border-card-border bg-card-background px-2.5 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-background-soft-100 hover:text-text-primary"
              >
                Can I get more info...?
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip("Status update...")}
                className="rounded-full border border-card-border bg-card-background px-2.5 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-background-soft-100 hover:text-text-primary"
              >
                Status update...
              </button>
            </div>
          </div>

          {isFocused && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="xs" onPress={handlePostComment} className="h-7 text-xs font-semibold">
                  Save
                </Button>
                <Button
                  appearance="ghost"
                  variant="ghost"
                  size="xs"
                  onPress={() => setIsFocused(false)}
                  className="h-7 text-xs text-text-secondary"
                >
                  Cancel
                </Button>
              </div>
              <span className="text-[11px] text-text-tertiary">
                Pro tip: press <kbd className="rounded bg-background-soft-100 px-1 font-mono">M</kbd> to comment
              </span>
            </div>
          )}

          {!isFocused && (
            <p className="text-[11px] text-text-tertiary">
              Pro tip: press <kbd className="rounded bg-background-soft-100 px-1 font-mono">M</kbd> to comment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
