"use client";

import Link from "next/link";
import { CalendarTime } from "@tailgrids/icons";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import type { StudentTaskItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { formatDate } from "@/utils/format-date";

import {
  StudentTaskPriority,
  StudentTaskStatusBadge,
  taskStatusLabel,
  taskTypeLabel,
} from "../../students/_components/student-task-badges";

interface TaskManagementTableProps {
  tasks: TaskManagementItem[];
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
}

function isOverdue(task: TaskManagementItem): boolean {
  if (task.status === "done") return false;
  return new Date(`${task.dueDate}T${task.dueTime || "23:59"}`).getTime() < Date.now();
}

function taskHref(task: TaskManagementItem): string {
  return `/director/students/${task.studentId}?tab=activities&taskId=${task.id}`;
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function TaskManagementTable({ tasks, onUpdateTask }: TaskManagementTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="font-medium text-text-primary">Không tìm thấy task phù hợp</p>
        <p className="mt-1 text-sm text-text-tertiary">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm task.</p>
      </div>
    );
  }

  return (
    <TableRoot className="w-full min-w-225 rounded-none border-none">
      <TableHeader className="bg-background-gray-secondary/50 [&_th]:border-t">
        <TableRow>
          <TableHead className="min-w-72 text-xs leading-4 font-semibold text-text-secondary">Tên task</TableHead>
          <TableHead className="min-w-48 text-xs leading-4 font-semibold text-text-secondary">Học sinh</TableHead>
          <TableHead className="min-w-36 text-xs leading-4 font-semibold text-text-secondary">Trạng thái</TableHead>
          <TableHead className="min-w-40 text-xs leading-4 font-semibold text-text-secondary">Hạn xử lý</TableHead>
          <TableHead className="min-w-32 text-xs leading-4 font-semibold text-text-secondary">Loại task</TableHead>
          <TableHead className="min-w-32 text-xs leading-4 font-semibold text-text-secondary">Ưu tiên</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const overdue = isOverdue(task);
          return (
            <TableRow key={task.id} className="transition hover:bg-background-soft-50">
              <TableCell>
                <Link
                  href={taskHref(task)}
                  className="group block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <p className="truncate font-semibold text-text-primary group-hover:text-primary-500 group-hover:underline">
                    {task.title}
                  </p>
                  {task.notes && <p className="mt-1 max-w-80 truncate text-xs text-text-tertiary">{plainText(task.notes)}</p>}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={taskHref(task)} className="flex items-center gap-2 text-text-primary hover:text-primary-500">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text">
                    {task.studentInitials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{task.studentName}</span>
                    <span className="block truncate text-xs text-text-tertiary">{task.studentCode}</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <SelectStatus task={task} onUpdateTask={onUpdateTask} />
              </TableCell>
              <TableCell>
                <span className={overdue ? "inline-flex items-center gap-1.5 font-semibold text-error-500" : "inline-flex items-center gap-1.5 text-text-secondary"}>
                  <CalendarTime size={15} aria-hidden="true" />
                  {formatDate(task.dueDate)}
                  <span className="text-xs">{task.dueTime}</span>
                </span>
                {overdue && <span className="mt-1 block text-xs font-medium text-error-500">Quá hạn</span>}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-text-primary">{taskTypeLabel[task.taskType ?? "todo"]}</span>
              </TableCell>
              <TableCell>
                <StudentTaskPriority priority={task.priority} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </TableRoot>
  );
}

function SelectStatus({ task, onUpdateTask }: { task: TaskManagementItem; onUpdateTask: TaskManagementTableProps["onUpdateTask"] }) {
  const options: StudentTaskItem["status"][] = ["todo", "in-progress", "done"];
  return (
    <Select
      value={task.status}
      onChange={(value) => onUpdateTask(task.id, { status: String(value) as StudentTaskItem["status"] })}
      aria-label={`Cập nhật trạng thái task ${task.title}`}
    >
      <SelectTrigger size="sm" className="w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0">
        <StudentTaskStatusBadge status={task.status} />
        <SelectValue className="sr-only" />
        <SelectIndicator className="ml-1 text-text-primary" />
      </SelectTrigger>
      <SelectContent className="min-w-40">
        {options.map((option) => (
          <SelectItem key={option} id={option} textValue={taskStatusLabel[option]}>
            <StudentTaskStatusBadge status={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
