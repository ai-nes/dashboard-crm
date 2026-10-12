import type { TaskCreateFormValues } from "@/app/(with-layouts)/(dashboard)/director/tasks/_components/task-create-form";
import type {
  CreateTaskPayload,
  CRMTaskPriority,
  CRMTaskStatus,
  CRMTask,
  UpdateTaskPayload,
} from "@/services/api/crm-tasks";
import {
  crmDateTimeToApi,
  crmTaskDateForInput,
  crmTaskDateTimeParts,
} from "@/utils/crm-task-date-time";
import type { SegmentTaskFormValues } from "./segment-task-dialog";

const priorityToApi: Record<TaskCreateFormValues["priority"], CRMTaskPriority> =
  {
    Cao: "High",
    "Trung bình": "Medium",
    Thấp: "Low",
  };

const statusToApi: Record<TaskCreateFormValues["status"], CRMTaskStatus> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
  canceled: "Canceled",
};

function toApiDateTime(date: string, time: string): string | undefined {
  if (!date) return undefined;
  return `${date} ${time || "23:59"}:00`;
}

export type SegmentTaskCreatePayload = Pick<
  CreateTaskPayload,
  "title" | "description" | "actionCode" | "priority" | "status" | "dueDate"
>;

export function taskCreateFormValuesToSegmentPayload(
  values: TaskCreateFormValues,
): SegmentTaskCreatePayload {
  const notes = values.notes.replace(/<[^>]*>/g, "").trim();

  return {
    title: values.title.trim(),
    ...(notes ? { description: values.notes } : {}),
    ...(values.actionCode ? { actionCode: values.actionCode } : {}),
    priority: priorityToApi[values.priority],
    status: statusToApi[values.status],
    dueDate: toApiDateTime(values.dueDate, values.dueTime),
  };
}

export function segmentTaskFormValuesToUpdatePayload(
  values: SegmentTaskFormValues,
  original?: Pick<CRMTask, "startDate" | "dueDate">,
): Omit<UpdateTaskPayload, "name"> {
  const datePatch = (
    date: string,
    saved: string | undefined,
    defaultTime: string,
  ) => {
    if (!date) return null;
    if (saved && date === crmTaskDateForInput(saved)) return saved;
    return (
      crmDateTimeToApi(date, crmTaskDateTimeParts(saved).time ?? defaultTime) ??
      null
    );
  };
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    status: values.status,
    startDate: datePatch(values.startDate, original?.startDate, "00:00"),
    dueDate: datePatch(values.dueDate, original?.dueDate, "23:59"),
    assignedTo: values.assignedTo.trim() || null,
  };
}
