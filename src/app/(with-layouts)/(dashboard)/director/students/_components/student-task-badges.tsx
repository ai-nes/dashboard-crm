import { Badge } from "@/components/tailgrids/core/badge";
import { CRM_TASK_STATUS_LABEL } from "@/services/api/crm-tasks";
import { getTaskActionMetadata } from "@/services/api/tasks/action-catalog";
import type {
  StudentTaskItem,
  StudentTaskType,
} from "@/services/api/students/types";
import { cn } from "@/utils/cn";

type BadgeColor = "gray" | "warning" | "success" | "error";

export const taskStatusLabel: Record<StudentTaskItem["status"], string> = {
  todo: CRM_TASK_STATUS_LABEL.Todo,
  "in-progress": CRM_TASK_STATUS_LABEL["In Progress"],
  done: CRM_TASK_STATUS_LABEL.Done,
  canceled: CRM_TASK_STATUS_LABEL.Canceled,
};

export const taskStatusColor: Record<StudentTaskItem["status"], BadgeColor> = {
  todo: "gray",
  "in-progress": "warning",
  done: "success",
  canceled: "gray",
};

export const taskTypeLabel: Record<StudentTaskType, string> = {
  call: "Cuộc gọi",
  email: "Email",
  todo: "Việc cần làm",
};

const compactTaskActionLabels: Record<string, string> = {
  REQUEST_MISSING_DOCUMENT: "Bổ sung giấy tờ",
  GUIDE_NEXT_STEP: "Hướng dẫn",
  CONTACT_PARENT: "Liên hệ PH",
  ESCALATE_TO_SENIOR: "Chuyển cấp cao",
  ADVISE_MAJOR: "Tư vấn ngành",
};

export function StudentTaskTypeBadge({
  actionCode,
  taskType = "todo",
  size = "sm",
  className,
  compact = false,
}: {
  actionCode?: string;
  taskType?: StudentTaskType;
  size?: "sm" | "md";
  className?: string;
  compact?: boolean;
}) {
  const code = actionCode?.trim();
  const action = getTaskActionMetadata(code);
  const normalizedCode = code?.toUpperCase();
  const fullLabel = action?.displayName || taskTypeLabel[taskType];
  const label =
    (compact && normalizedCode && compactTaskActionLabels[normalizedCode]) ||
    fullLabel;

  return (
    <Badge
      color={action?.color ?? "gray"}
      size={size}
      prefixIcon={
        action ? (
          <span
            className="size-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
        ) : undefined
      }
      title={
        code
          ? `${code} · ${fullLabel}${action?.description ? ` · ${action.description}` : ""}`
          : `Loại task: ${fullLabel}`
      }
      className={cn("whitespace-nowrap font-semibold", className)}
    >
      {label}
    </Badge>
  );
}

const priorityDotClass: Record<StudentTaskItem["priority"], string> = {
  Cao: "bg-badge-error-icon-color",
  "Trung bình": "bg-badge-warning-icon-color",
  Thấp: "bg-badge-neutral-icon-color",
};

const priorityBadgeColor: Record<StudentTaskItem["priority"], BadgeColor> = {
  Cao: "error",
  "Trung bình": "warning",
  Thấp: "gray",
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
    <Badge
      color={priorityBadgeColor[priority]}
      size={size}
      prefixIcon={
        <span
          className={`shrink-0 rounded-full ${
            size === "sm" ? "size-1.5" : "size-2"
          } ${priorityDotClass[priority]}`}
          aria-hidden="true"
        />
      }
      className="whitespace-nowrap font-semibold"
    >
      {priority}
    </Badge>
  );
}
