"use client";

import { Check } from "@tailgrids/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import type { StudentTaskItem } from "@/services/api/students/types";
import { MenuDotsIcon } from "@/utils/icon";

import { StudentTaskStatusBadge } from "../../students/_components/student-task-badges";

interface TaskManagementTaskActionsProps {
  task: TaskManagementItem;
  onUpdateTask: (
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
  onUpdateTask,
  onDeleteTask,
}: TaskManagementTaskActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Tùy chọn task của ${task.studentName}`}
        className="flex size-7 items-center justify-center rounded-md text-text-tertiary outline-none transition hover:bg-background-soft-50 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <MenuDotsIcon className="size-4 rotate-90" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        placement="bottom end"
        style={{ zIndex: 50 }}
        className="w-48 p-1"
      >
        <DropdownMenuHeader className="px-2.5 py-1.5 text-[11px] font-semibold text-text-tertiary">
          Chuyển trạng thái
        </DropdownMenuHeader>
        <DropdownMenuSection className="p-1">
          {statusOptions.map((status) => (
            <DropdownMenuItem
              key={status}
              onAction={() => onUpdateTask(task.id, { status })}
              className="justify-between px-2.5 py-1.5 text-xs"
            >
              <StudentTaskStatusBadge status={status} size="sm" />
              {task.status === status && (
                <Check size={14} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>
        {onDeleteTask && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onAction={() => onDeleteTask(task.id)}
              className="px-2.5 py-1.5 text-xs text-error-500 hover:bg-badge-error-background focus:bg-badge-error-background"
            >
              Xóa task
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
