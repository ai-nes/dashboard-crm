import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/services/api/crm-tasks";
import type {
  StudentPriority,
  StudentTaskItem,
} from "@/services/api/students/types";

const priorityToApi: Record<StudentPriority, CRMTaskPriority> = {
  Cao: "High",
  "Trung bình": "Medium",
  Thấp: "Low",
};

const priorityFromApi: Record<CRMTaskPriority, StudentPriority> = {
  High: "Cao",
  Medium: "Trung bình",
  Low: "Thấp",
};

const statusToApi: Record<StudentTaskItem["status"], CRMTaskStatus> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
  canceled: "Canceled",
};

const statusFromApi: Record<CRMTaskStatus, StudentTaskItem["status"]> = {
  Backlog: "todo",
  Todo: "todo",
  "In Progress": "in-progress",
  Done: "done",
  Canceled: "canceled",
};

function normalizeDateParts(value?: string): {
  date: string;
  time?: string;
} {
  if (!value) return { date: "" };

  const normalized = value.trim().replace("T", " ");
  const [datePart, timePart] = normalized.split(/\s+/, 2);
  const isoMatch = datePart?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      date: `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`,
      time: timePart?.slice(0, 5) || undefined,
    };
  }

  const vietnameseMatch = datePart?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vietnameseMatch) {
    return {
      date: `${vietnameseMatch[1].padStart(2, "0")}/${vietnameseMatch[2].padStart(2, "0")}/${vietnameseMatch[3]}`,
      time: timePart?.slice(0, 5) || undefined,
    };
  }

  return { date: value, time: undefined };
}

function toIsoDate(value: string): string {
  const trimmed = value.trim();
  const vietnameseMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (vietnameseMatch) {
    return `${vietnameseMatch[3]}-${vietnameseMatch[2]}-${vietnameseMatch[1]}`;
  }
  return trimmed;
}

function toFrappeDateTime(date: string, time?: string): string | undefined {
  if (!date) return undefined;
  return `${toIsoDate(date)} ${time || "23:59"}:00`;
}

export function crmTaskToStudentTask(
  task: CRMTask,
  fallbackAssignee: string,
): StudentTaskItem {
  const due = normalizeDateParts(task.dueDate);

  return {
    id: task.name,
    title: task.title,
    assignee: task.assignedTo || fallbackAssignee,
    dueDate: due.date,
    dueTime: due.time,
    status: task.status ? statusFromApi[task.status] : "todo",
    priority: task.priority ? priorityFromApi[task.priority] : "Trung bình",
    taskType: "todo",
    notes: task.description || undefined,
  };
}

export function studentTaskToCreatePayload(
  task: StudentTaskItem,
  referenceDocname: string,
  assignedTo?: string,
): CreateTaskPayload {
  return {
    referenceDoctype: "CRM Student",
    referenceDocname,
    title: task.title,
    description: task.notes,
    priority: priorityToApi[task.priority],
    status: statusToApi[task.status],
    dueDate: toFrappeDateTime(task.dueDate, task.dueTime),
    ...(assignedTo ? { assignedTo } : {}),
  };
}

export function studentTaskToUpdatePayload(
  taskId: string,
  currentTask: StudentTaskItem,
  updates: Partial<StudentTaskItem>,
): UpdateTaskPayload {
  const payload: UpdateTaskPayload = { name: taskId };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.notes !== undefined) payload.description = updates.notes;
  if (updates.priority !== undefined) {
    payload.priority = priorityToApi[updates.priority];
  }
  if (updates.status !== undefined) payload.status = statusToApi[updates.status];

  if (updates.dueDate !== undefined || updates.dueTime !== undefined) {
    const nextTask = { ...currentTask, ...updates };
    payload.dueDate = toFrappeDateTime(nextTask.dueDate, nextTask.dueTime);
  }

  return payload;
}
