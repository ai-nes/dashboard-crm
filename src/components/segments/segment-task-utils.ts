import { CRM_TASK_STATUS_LABEL, type CRMTask } from "@/services/api/crm-tasks";
import { formatDate, formatDateTime } from "@/utils/format-date";

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

function toDateInputValue(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function getTaskDueAt(task: CRMTask): number | null {
  const dateValue = toDateInputValue(task.dueDate);
  if (!dateValue) return null;

  const dueAt = new Date(`${dateValue}T23:59:59`).getTime();
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
      detail: `Đã quá hạn từ ${formatDate(task.dueDate)}`,
    };
  }

  const differenceInHours = (dueAt - now) / 3_600_000;
  if (differenceInHours <= 48) {
    return {
      tone: "soon",
      label: "Sắp đến hạn",
      detail: `Hạn xử lý ${formatDate(task.dueDate)}`,
    };
  }

  return {
    tone: "upcoming",
    label: "Sắp tới",
    detail: `Hạn xử lý ${formatDate(task.dueDate)}`,
  };
}

export function getSegmentTaskDate(task: CRMTask): Date {
  const source = task.dueDate || task.modified || task.creation;
  if (!source) return new Date(0);

  const vnMatch = source.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*·\s*(\d{1,2}):(\d{2}))?/,
  );
  if (vnMatch) {
    const [, day, month, year, hour = "0", minute = "0"] = vnMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );
  }

  const dateOnly = source.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dateGroupLabel(date: Date): string {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const daysFromToday = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (daysFromToday === 0) return "Hôm nay";
  if (daysFromToday === 1) return "Hôm qua";
  return formatDate(date);
}

export function groupSegmentTasks(tasks: CRMTask[]): SegmentTaskGroup[] {
  const groups = new Map<string, SegmentTaskGroup>();

  for (const task of tasks) {
    const date = getSegmentTaskDate(task);
    const overdue = isSegmentTaskOverdue(task);
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
          ? dateGroupLabel(date)
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
  return formatDate(value, fallback);
}

export function formatSegmentTaskDateTime(
  value?: string,
  fallback = "Chưa thiết lập",
): string {
  return formatDateTime(value, fallback);
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
