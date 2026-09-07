"use client";

import Link from "next/link";
import { CalendarTime, UserCircle1 } from "@tailgrids/icons";
import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { formatDate } from "@/utils/format-date";

import {
  StudentTaskPriority,
  StudentTaskTypeBadge,
} from "../../students/_components/student-task-badges";

interface TaskDetailPropertiesProps {
  task: TaskManagementItem;
}

interface TaskDetailRowProps {
  label: string;
  children: ReactNode;
}

function taskHref(task: TaskManagementItem): string {
  return `/director/students/${task.studentId}?tab=activities&taskId=${task.id}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function TaskDetailRow({ label, children }: TaskDetailRowProps) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 py-2.5 sm:grid-cols-[8.25rem_minmax(0,1fr)]">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <div className="min-w-0 text-left text-sm font-medium text-text-primary">
        {children}
      </div>
    </div>
  );
}

function AssigneeValue({ name }: { name?: string }) {
  const isUnassigned = !name || name === "Chưa phân công";

  if (isUnassigned) {
    return (
      <span className="inline-flex items-center gap-2 text-text-secondary">
        <UserCircle1 size={18} aria-hidden="true" />
        <span>Chưa phân công</span>
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-[10px] font-semibold text-badge-primary-text">
        {getInitials(name)}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

function StudentValue({ task }: { task: TaskManagementItem }) {
  return (
    <Link
      href={taskHref(task)}
      aria-label={`Mở hồ sơ học sinh ${task.studentName}`}
      className="group inline-flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-[10px] font-semibold text-badge-primary-text">
        {task.studentInitials}
      </span>
      <span className="min-w-0 truncate group-hover:text-primary-600">
        {task.studentName}
      </span>
    </Link>
  );
}

function EmptyValue({ label = "Chưa thiết lập" }: { label?: string }) {
  return <span className="font-normal text-text-tertiary">{label}</span>;
}

export default function TaskDetailProperties({
  task,
}: TaskDetailPropertiesProps) {
  return (
    <div className="px-3 pb-2">
      <TaskDetailRow label="Người phụ trách">
        <AssigneeValue name={task.assignee} />
      </TaskDetailRow>
      <TaskDetailRow label="Học sinh">
        <StudentValue task={task} />
      </TaskDetailRow>
      <TaskDetailRow label="Mức ưu tiên">
        <StudentTaskPriority priority={task.priority} size="sm" />
      </TaskDetailRow>
      <TaskDetailRow label="Loại task">
        <StudentTaskTypeBadge
          actionCode={task.actionCode}
          taskType={task.taskType}
          size="sm"
          compact
        />
      </TaskDetailRow>
      <TaskDetailRow label="Hạn xử lý">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <CalendarTime size={15} aria-hidden="true" />
          {formatDate(task.dueDate)}
          {task.dueTime && (
            <span className="font-normal text-text-secondary">
              · {task.dueTime}
            </span>
          )}
        </span>
      </TaskDetailRow>
      <TaskDetailRow label="Nhãn">
        {task.actionCode ? (
          <Badge color="gray" size="sm" className="font-medium">
            {task.actionCode}
          </Badge>
        ) : (
          <EmptyValue />
        )}
      </TaskDetailRow>
      {task.activityDate && (
        <TaskDetailRow label="Ngày hoạt động">
          <span className="font-normal text-text-secondary">
            {formatDate(task.activityDate)}
          </span>
        </TaskDetailRow>
      )}
    </div>
  );
}
