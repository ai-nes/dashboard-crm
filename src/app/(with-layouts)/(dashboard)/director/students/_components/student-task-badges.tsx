import { Badge } from "@/components/tailgrids/core/badge";
import type {
  StudentTaskItem,
  StudentTaskType,
} from "@/services/api/students/types";

type BadgeColor = "gray" | "warning" | "success" | "error";

export const taskStatusLabel: Record<StudentTaskItem["status"], string> = {
  todo: "Cần làm",
  "in-progress": "Đang xử lý",
  done: "Hoàn thành",
  canceled: "Đã hủy",
};

export const taskStatusColor: Record<StudentTaskItem["status"], BadgeColor> = {
  todo: "gray",
  "in-progress": "warning",
  done: "success",
  canceled: "error",
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

export function StudentTaskStatusBadge({
  status,
  size = "md",
}: {
  status: StudentTaskItem["status"];
  size?: "sm" | "md";
}) {
  return (
    <Badge
      color={taskStatusColor[status]}
      size={size}
      className="whitespace-nowrap font-semibold"
    >
      {taskStatusLabel[status]}
    </Badge>
  );
}
export function StudentTaskPriority({
  priority,
  size = "md",
}: {
  priority: StudentTaskItem["priority"];
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-semibold text-text-primary ${
        size === "sm" ? "gap-1.5 text-sm" : "gap-2 text-base"
      }`}
    >
      <span
        className={`shrink-0 rounded-full ${
          size === "sm" ? "size-2" : "size-2.5"
        } ${priorityDotClass[priority]}`}
        aria-hidden="true"
      />
      {priority}
    </span>
  );
}
