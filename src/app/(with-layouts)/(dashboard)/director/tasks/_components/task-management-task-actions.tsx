"use client";

import { Check } from "@tailgrids/icons";

import { TableRowActions } from "@/components/common/table-row-actions";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import type { StudentTaskItem } from "@/services/api/students/types";
import { taskStatusLabel } from "../../students/_components/student-task-badges";

interface TaskManagementTaskActionsProps {
  task: TaskManagementItem;
  onOpenTask?: () => void;
  onUpdateTask?: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
}

const statusOptions: StudentTaskItem["status"][] = [
  "todo",
  "in-progress",
  "done",
  "canceled",
];

export default function TaskManagementTaskActions({
  task,
  onOpenTask,
  onUpdateTask,
  onDeleteTask,
}: TaskManagementTaskActionsProps) {
  return (
    <TableRowActions label={`task ${task.title}`} actions={[
      { id: "view", label: "Xem chi tiết", onAction: onOpenTask },
      ...statusOptions.map((status) => ({
        id: status,
        label: `Chuyển sang ${taskStatusLabel[status]}`,
        icon: task.status === status ? <Check size={16} aria-hidden="true" /> : undefined,
        onAction: () => { void onUpdateTask?.(task.id, { status }); },
        isVisible: Boolean(onUpdateTask),
      })),
      { id: "delete", label: "Xóa task", onAction: onDeleteTask ? () => onDeleteTask(task.id) : undefined, variant: "danger" },
    ]} />
  );
}
