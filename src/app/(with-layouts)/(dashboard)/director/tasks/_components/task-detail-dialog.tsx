"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type {
  StudentPriority,
  StudentTaskItem,
} from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { formatDate } from "@/utils/format-date";

import TaskCreateDialogShell from "./task-create-dialog-shell";
import TaskDialogHeader from "./task-dialog-header";
import TaskDialogTitle from "./task-dialog-title";
import TaskDialogDescription from "./task-dialog-description";
import TaskDialogSidebar from "./task-dialog-sidebar";

export interface TaskDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskManagementItem | null;
  onUpdateTask?: (
    id: string,
    updates: Partial<TaskManagementItem>,
  ) => void | Promise<void>;
}

function taskCode(task: TaskManagementItem): string {
  if (task.studentCode) {
    const numeric = task.id.replace(/\D/g, "").slice(-3) || "1";
    return `${task.studentCode}-${numeric}`;
  }
  return `TASK-${task.id.replace(/\D/g, "").slice(-4) || "1"}`;
}

interface TaskDetailDialogContentProps {
  task: TaskManagementItem;
  onUpdateTask?: (
    id: string,
    updates: Partial<TaskManagementItem>,
  ) => void | Promise<void>;
  onClose: () => void;
}

function TaskDetailDialogContent({
  task,
  onUpdateTask,
  onClose,
}: TaskDetailDialogContentProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleSaveTitle = () => {
    if (!title.trim() || title === task.title) return;
    onUpdateTask?.(task.id, { title: title.trim() });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    onUpdateTask?.(task.id, { notes: newNotes.trim() });
  };

  const handleStatusChange = (status: StudentTaskItem["status"]) => {
    onUpdateTask?.(task.id, { status });
  };

  const handlePriorityChange = (priority: StudentPriority) => {
    onUpdateTask?.(task.id, { priority });
  };

  const handleDueDateChange = (dueDate: string) => {
    onUpdateTask?.(task.id, { dueDate });
  };

  const handleDueTimeChange = (dueTime: string) => {
    onUpdateTask?.(task.id, { dueTime });
  };

  const studentLink = (
    <Link
      href={`/director/students/${task.studentId}?tab=activities&taskId=${task.id}`}
      className="inline-flex items-center gap-1.5 font-medium text-text-primary hover:text-primary-600 hover:underline"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">
        {task.studentInitials || task.studentName.slice(0, 2).toUpperCase()}
      </span>
      <span className="truncate">{task.studentName}</span>
    </Link>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-white-primary">
      {/* Header chuẩn Jira gọn gàng */}
      <TaskDialogHeader
        breadcrumbContext={task.studentName}
        taskKey={taskCode(task)}
        onClose={onClose}
      />

      {/* Body 2 cột chuẩn Jira */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_21rem]">
          {/* Cột trái: Tiêu đề + Ghi chú task */}
          <div className="flex min-h-full min-w-0 flex-col space-y-6 p-5 sm:p-7">
            <div className="shrink-0" onBlur={handleSaveTitle}>
              <TaskDialogTitle
                value={title}
                onChange={handleTitleChange}
                placeholder="Tiêu đề task..."
                className="shrink-0"
              />
            </div>

            <TaskDialogDescription
              value={notes}
              onChange={handleNotesChange}
              placeholder="Mô tả chi tiết công việc cần làm..."
            />
          </div>

          {/* Cột phải: Sidebar thuộc tính & metadata */}
          <div className="border-t border-card-border bg-background-soft-50/30 p-5 lg:border-t-0 lg:border-l">
            <TaskDialogSidebar
              status={task.status}
              onStatusChange={handleStatusChange}
              assigneeName={task.assignee || "Chưa phân công"}
              parentField={studentLink}
              priority={task.priority}
              onPriorityChange={handlePriorityChange}
              actionCode={task.actionCode || "CREATE_TASK"}
              dueDate={formatDate(task.dueDate)}
              onDueDateChange={handleDueDateChange}
              dueTime={task.dueTime || "09:00"}
              onDueTimeChange={handleDueTimeChange}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex shrink-0 justify-end border-t border-card-border bg-background-white-primary px-5 py-3 sm:px-6">
        <Button
          appearance="outline"
          variant="ghost"
          size="sm"
          onPress={onClose}
        >
          Đóng
        </Button>
      </footer>
    </div>
  );
}

export default function TaskDetailDialog({
  isOpen,
  onOpenChange,
  task,
  onUpdateTask,
}: TaskDetailDialogProps) {
  if (!task) return null;

  return (
    <TaskCreateDialogShell
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      ariaLabel={`Chi tiết task: ${task.title}`}
    >
      <TaskDetailDialogContent
        key={task.id}
        task={task}
        onUpdateTask={onUpdateTask}
        onClose={() => onOpenChange(false)}
      />
    </TaskCreateDialogShell>
  );
}
