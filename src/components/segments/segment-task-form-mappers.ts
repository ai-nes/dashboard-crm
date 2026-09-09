import type { TaskCreateFormValues } from "@/app/(with-layouts)/(dashboard)/director/tasks/_components/task-create-form";
import type {
  CreateTaskPayload,
  CRMTaskPriority,
  CRMTaskStatus,
} from "@/services/api/crm-tasks";

const priorityToApi: Record<
  TaskCreateFormValues["priority"],
  CRMTaskPriority
> = {
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

function toFrappeDateTime(date: string, time: string): string | undefined {
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
    dueDate: toFrappeDateTime(values.dueDate, values.dueTime),
  };
}
