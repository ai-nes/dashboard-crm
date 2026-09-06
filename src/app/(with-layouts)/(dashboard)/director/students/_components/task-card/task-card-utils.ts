import type { StudentTaskItem } from "@/services/api/students/types";
import { formatDate } from "@/utils/format-date";

export type TaskDeadlineTone =
  | "overdue"
  | "soon"
  | "upcoming"
  | "complete"
  | "unscheduled";

export interface TaskDeadlineStatus {
  tone: TaskDeadlineTone;
  label: string;
  detail: string;
}

export function toDateInputValue(value: string): string {
  const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month}-${day}`;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export function fromDateInputValue(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function formatTaskDeadline(task: StudentTaskItem): string {
  const date = formatDate(task.dueDate);
  return task.dueTime ? `${date} · ${task.dueTime}` : date;
}

export function getTaskDeadlineStatus(
  task: StudentTaskItem,
  now = Date.now(),
): TaskDeadlineStatus {
  if (task.status === "done") {
    return {
      tone: "complete",
      label: "Đã hoàn thành",
      detail: "Task đã được xử lý",
    };
  }

  if (task.status === "canceled") {
    return {
      tone: "unscheduled",
      label: "Đã hủy",
      detail: "Task không còn cần xử lý",
    };
  }

  const dueAt = getTaskDueAt(task);
  if (dueAt === null) {
    return {
      tone: "unscheduled",
      label: "Chưa đặt hạn",
      detail: "Chưa có thời điểm xử lý",
    };
  }

  const differenceInMinutes = Math.round((dueAt - now) / 60_000);
  if (differenceInMinutes < 0) {
    const elapsed = formatDuration(Math.abs(differenceInMinutes));
    return {
      tone: "overdue",
      label: `Quá hạn ${elapsed}`,
      detail: `Đã quá hạn ${elapsed}`,
    };
  }

  if (differenceInMinutes <= 48 * 60) {
    const remaining = formatDuration(differenceInMinutes);
    return {
      tone: "soon",
      label: `Sắp đến hạn ${remaining}`,
      detail: `Còn ${remaining} để xử lý`,
    };
  }

  const remaining = formatDuration(differenceInMinutes);
  return {
    tone: "upcoming",
    label: `Còn ${remaining}`,
    detail: `Còn ${remaining} để xử lý`,
  };
}

export function getTaskDueAt(task: StudentTaskItem): number | null {
  const dateValue = toDateInputValue(task.dueDate);
  if (!dateValue) return null;

  const dueAt = new Date(
    `${dateValue}T${task.dueTime || "23:59"}`,
  ).getTime();
  return Number.isNaN(dueAt) ? null : dueAt;
}

export function getAssigneeInitials(assignee: string): string {
  const initials = assignee
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "—";
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, minutes)} phút`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ`;

  const days = Math.round(hours / 24);
  return `${days} ngày`;
}
