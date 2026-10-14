import { CRM_TASK_STATUS_LABEL, type CRMTask } from "@/services/api/crm-tasks";
import {
  crmCurrentDateKey,
  crmDateTimeToApi,
  crmTaskDateKey,
  crmTaskDateTimeParts,
} from "@/utils/crm-task-date-time";

export type SegmentTaskDeadlineTone =
  | "overdue"
  | "soon"
  | "upcoming"
  | "complete"
  | "unscheduled";

export interface SegmentTaskDeadlineStatus {
  tone: SegmentTaskDeadlineTone;
  label: string;
  detail: string;
}

export interface SegmentTaskGroup {
  id: string;
  label: string;
  sortTime: number;
  tasks: CRMTask[];
}

export const SEGMENT_TASK_STATUS_LABEL: Record<
  NonNullable<CRMTask["status"]>,
  string
> = CRM_TASK_STATUS_LABEL;

export const SEGMENT_TASK_STATUS_COLOR: Record<
  NonNullable<CRMTask["status"]>,
  "gray" | "blue" | "success" | "error" | "warning"
> = {
  Backlog: "gray",
  Todo: "gray",
  "In Progress": "warning",
  Done: "success",
  Canceled: "gray",
};

export const SEGMENT_TASK_PRIORITY_LABEL: Record<
  NonNullable<CRMTask["priority"]>,
  string
> = {
  Low: "Thấp",
  Medium: "Trung bình",
  High: "Cao",
};

export const SEGMENT_TASK_PRIORITY_COLOR: Record<
  NonNullable<CRMTask["priority"]>,
  "gray" | "error" | "warning"
> = {
  Low: "gray",
  Medium: "warning",
  High: "error",
};

function getTaskDueAt(task: CRMTask): number | null {
  if (!task.dueDate) return null;
  const parts = crmTaskDateTimeParts(task.dueDate);
  const value = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(task.dueDate)
    ? task.dueDate
    : crmDateTimeToApi(parts.date, parts.time ?? "23:59");
  if (!value) return null;
  const dueAt = new Date(value).getTime();
  return Number.isNaN(dueAt) ? null : dueAt;
}

export function isSegmentTaskOverdue(task: CRMTask, now = Date.now()): boolean {
  if (task.status === "Done" || task.status === "Canceled") return false;

  const dueAt = getTaskDueAt(task);
  return dueAt !== null && dueAt < now;
}

export function getSegmentTaskDeadlineStatus(
  task: CRMTask,
  now = Date.now(),
): SegmentTaskDeadlineStatus {
  if (task.status === "Done") {
    return {
      tone: "complete",
      label: "Đã hoàn thành",
      detail: "Task đã được xử lý",
    };
  }

  if (task.status === "Canceled") {
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

  if (dueAt < now) {
    return {
      tone: "overdue",
      label: "Quá hạn",
      detail: `Đã quá hạn từ ${formatSegmentTaskDate(task.dueDate)}`,
    };
  }

  const differenceInHours = (dueAt - now) / 3_600_000;
  if (differenceInHours <= 48) {
    return {
      tone: "soon",
      label: "Sắp đến hạn",
      detail: `Hạn xử lý ${formatSegmentTaskDate(task.dueDate)}`,
    };
  }

  return {
    tone: "upcoming",
    label: "Sắp tới",
    detail: `Hạn xử lý ${formatSegmentTaskDate(task.dueDate)}`,
  };
}

export function getSegmentTaskDate(task: CRMTask): Date {
  const source = task.dueDate || task.modified || task.creation;
  if (!source) return new Date(0);

  const parts = crmTaskDateTimeParts(source);
  const value = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(source)
    ? source
    : crmDateTimeToApi(parts.date, parts.time ?? "00:00");
  const parsed = new Date(value ?? "");
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function dateKey(date: Date): string {
  return crmTaskDateKey(date.toISOString());
}

function dateGroupLabel(date: Date, now: number): string {
  const startOfToday = new Date(
    `${crmCurrentDateKey(new Date(now))}T00:00:00Z`,
  );
  const startOfDate = new Date(`${dateKey(date)}T00:00:00Z`);
  const daysFromToday = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (daysFromToday === 0) return "Hôm nay";
  if (daysFromToday === 1) return "Hôm qua";
  return formatSegmentTaskDate(date.toISOString());
}

export function groupSegmentTasks(
  tasks: CRMTask[],
  now = Date.now(),
): SegmentTaskGroup[] {
  const groups = new Map<string, SegmentTaskGroup>();

  for (const task of tasks) {
    const date = getSegmentTaskDate(task);
    const overdue = isSegmentTaskOverdue(task, now);
    const validDate = date.getTime() > 0;
    const id = overdue ? "overdue" : validDate ? dateKey(date) : "unknown";
    const existing = groups.get(id);

    if (existing) {
      existing.tasks.push(task);
      continue;
    }

    groups.set(id, {
      id,
      label: overdue
        ? "Quá hạn"
        : validDate
          ? dateGroupLabel(date, now)
          : "Chưa xác định thời gian",
      tasks: [task],
      sortTime: overdue
        ? Number.MAX_SAFE_INTEGER
        : validDate
          ? date.getTime()
          : Number.MIN_SAFE_INTEGER,
    });
  }

  return Array.from(groups.values()).sort((a, b) => b.sortTime - a.sortTime);
}

export function formatSegmentTaskDate(
  value?: string,
  fallback = "Chưa thiết lập",
): string {
  return value ? crmTaskDateTimeParts(value).date || fallback : fallback;
}

export function formatSegmentTaskDateTime(
  value?: string,
  fallback = "Chưa thiết lập",
): string {
  if (!value) return fallback;
  const parts = crmTaskDateTimeParts(value);
  return parts.time ? `${parts.date} · ${parts.time}` : parts.date || fallback;
}

export function getAssigneeInitials(assignee?: string): string {
  const initials = assignee
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "—";
}
