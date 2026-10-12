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
import type { SessionUser } from "@/services/api/auth";
import {
  crmDateTimeToApi,
  crmTaskDateTimeParts,
} from "@/utils/crm-task-date-time";

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

export function studentTaskStatusToCrmStatus(
  status: StudentTaskItem["status"],
): CRMTaskStatus {
  return statusToApi[status];
}

export function crmTaskStatusToStudentStatus(
  status: CRMTaskStatus,
): StudentTaskItem["status"] {
  return statusFromApi[status];
}

export function crmTaskToStudentTask(
  task: CRMTask,
  fallbackAssignee: string,
  assignees: SessionUser[] = [],
): StudentTaskItem {
  const due = crmTaskDateTimeParts(task.dueDate);
  const assignedUser = assignees.find(
    (user) => user.name === task.assignedTo || user.email === task.assignedTo,
  );

  return {
    id: task.name,
    title: task.title,
    ownerId: task.owner,
    actionCode: task.actionCode,
    assignee: assignedUser?.full_name || task.assignedTo || fallbackAssignee,
    assigneeId: task.assignedTo,
    activityDate: task.creation || task.modified || task.dueDate,
    dueDate: due.date,
    dueTime: due.time,
    status: task.status ? crmTaskStatusToStudentStatus(task.status) : "todo",
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
    actionCode: task.actionCode,
    priority: priorityToApi[task.priority],
    status: studentTaskStatusToCrmStatus(task.status),
    dueDate: crmDateTimeToApi(task.dueDate, task.dueTime),
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
  if (updates.status !== undefined) {
    payload.status = studentTaskStatusToCrmStatus(updates.status);
  }

  if (updates.dueDate !== undefined || updates.dueTime !== undefined) {
    const nextTask = { ...currentTask, ...updates };
    payload.dueDate = crmDateTimeToApi(nextTask.dueDate, nextTask.dueTime);
  }

  return payload;
}
