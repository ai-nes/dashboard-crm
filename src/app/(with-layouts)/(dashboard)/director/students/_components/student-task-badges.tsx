import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentTaskItem, StudentTaskType } from "@/services/api/students/types";

type BadgeColor = "gray" | "warning" | "success";

export const taskStatusLabel: Record<StudentTaskItem["status"], string> = {
  todo: "Cần làm",
  "in-progress": "Đang xử lý",
  done: "Hoàn thành",
};

export const taskStatusColor: Record<StudentTaskItem["status"], BadgeColor> = {
  todo: "gray",
  "in-progress": "warning",
  done: "success",
};

export const taskTypeLabel: Record<StudentTaskType, string> = {
  call: "Cuộc gọi",
  email: "Email",
  todo: "Việc cần làm",
};

const priorityDotClass: Record<StudentTaskItem["priority"], string> = {
  Cao: "bg-badge-error-icon-color",
  "Trung bình": "bg-badge-warning-icon-color",
  Thấp: "bg-badge-success-icon-color",
};

export function StudentTaskStatusBadge({ status }: { status: StudentTaskItem["status"] }) {
  return (
    <Badge
      color={taskStatusColor[status]}
      size="md"
      className="whitespace-nowrap font-semibold"
    >
      {taskStatusLabel[status]}
    </Badge>
  );
}

export function StudentTaskPriority({ priority }: { priority: StudentTaskItem["priority"] }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-base font-semibold text-text-primary">
      <span
        className={`size-2.5 shrink-0 rounded-full ${priorityDotClass[priority]}`}
        aria-hidden="true"
      />
      {priority}
    </span>
  );
}
