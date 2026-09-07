"use client";

import type { StudentTaskItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskDetailDialog from "./task-detail-dialog";

export interface TaskDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskManagementItem | null;
  onUpdateTask?: (
    id: string,
    updates: Partial<TaskManagementItem> | Pick<StudentTaskItem, "status">,
  ) => void | Promise<void>;
}

export default function TaskDetailSheet({
  isOpen,
  onOpenChange,
  task,
  onUpdateTask,
}: TaskDetailSheetProps) {
  return (
    <TaskDetailDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      task={task}
      onUpdateTask={onUpdateTask}
    />
  );
}
