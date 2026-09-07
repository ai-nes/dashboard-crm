import { Calendar, ChevronDown, ChevronRight, Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import type { StudentTaskItem } from "@/services/api/students/types";
import { cn } from "@/utils/cn";

import { StudentTaskTypeBadge } from "../student-task-badges";
import type { TaskDeadlineStatus } from "./task-card-utils";

interface TaskCardHeaderProps {
  task: StudentTaskItem;
  deadlineStatus: TaskDeadlineStatus;
  expanded: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

export default function TaskCardHeader({
  task,
  deadlineStatus,
  expanded,
  onToggle,
  onDelete,
}: TaskCardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-background-gray-primary px-4 py-3.5 sm:px-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex min-w-0 items-center gap-2 rounded-md text-left text-sm font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <span className="shrink-0 text-text-tertiary" aria-hidden="true">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span className="truncate">Task</span>
        <span className="text-text-tertiary" aria-hidden="true">
          ·
        </span>
        <StudentTaskTypeBadge
          actionCode={task.actionCode}
          taskType={task.taskType}
          size="sm"
        />
        <span className="hidden truncate font-normal text-text-secondary sm:inline">
          · {task.assignee || "Chưa phân công"}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <DeadlineBadge status={deadlineStatus} />
        {onDelete ? (
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            appearance="ghost"
            aria-label={`Xóa task ${task.title}`}
            className="text-text-tertiary hover:text-error-500"
            onPress={onDelete}
          >
            <Trash1 size={15} aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function DeadlineBadge({ status }: { status: TaskDeadlineStatus }) {
  const toneClassName = {
    overdue: "border-error-200 bg-badge-error-background text-badge-error-text",
    soon: "border-warning-200 bg-badge-warning-background text-badge-warning-text",
    upcoming:
      "border-border-secondary bg-background-gray-secondary_alt text-text-secondary",
    complete:
      "border-success-200 bg-badge-success-background text-badge-success-text",
    unscheduled:
      "border-border-secondary bg-background-gray-secondary_alt text-text-secondary",
  }[status.tone];

  return (
    <span
      className={cn(
        "inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClassName,
      )}
      title={status.detail}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-current"
        aria-hidden="true"
      />
      <Calendar size={13} aria-hidden="true" />
      <span className="truncate">{status.label}</span>
    </span>
  );
}
