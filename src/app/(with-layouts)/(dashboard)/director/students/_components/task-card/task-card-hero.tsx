import type { StudentTaskItem } from "@/services/api/students/types";

import StudentInlineEditableText from "../student-inline-editable-text";
import {
  StudentTaskPriority,
  StudentTaskStatusBadge,
} from "../student-task-badges";
import {
  StudentTaskPrioritySelect,
  StudentTaskStatusSelect,
} from "../student-task-selects";
import TaskCardQuickStatusButton from "./task-card-quick-status-button";
import type { TaskDeadlineStatus } from "./task-card-utils";

interface TaskCardHeroProps {
  task: StudentTaskItem;
  deadlineStatus: TaskDeadlineStatus;
  studentStage?: string;
  compact?: boolean;
  onUpdateTask: (updates: Partial<StudentTaskItem>) => void;
  canEdit?: boolean;
}

export default function TaskCardHero({
  task,
  deadlineStatus,
  studentStage,
  compact = false,
  onUpdateTask,
  canEdit = true,
}: TaskCardHeroProps) {
  if (compact) {
    return (
      <div className="flex min-w-0 flex-1 items-start gap-2.5 px-4 py-3.5 sm:px-5">
        {canEdit ? (
          <TaskCardQuickStatusButton
            status={task.status}
            overdue={deadlineStatus.tone === "overdue"}
            onPress={() =>
              onUpdateTask({ status: getNextQuickStatus(task.status) })
            }
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <StudentInlineEditableText
            value={task.title}
            onCommit={(title) => onUpdateTask({ title })}
            canEdit={canEdit}
            strikethrough={task.status === "done" || task.status === "canceled"}
            textClassName="text-base leading-6 font-semibold"
            className="-mx-2 min-w-0"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {canEdit ? (
              <>
                <StudentTaskStatusSelect
                  taskTitle={task.title}
                  status={task.status}
                  onChange={(status) => onUpdateTask({ status })}
                />
                <StudentTaskPrioritySelect
                  taskTitle={task.title}
                  priority={task.priority}
                  onChange={(priority) => onUpdateTask({ priority })}
                />
              </>
            ) : (
              <>
                <StudentTaskStatusBadge status={task.status} size="sm" />
                <StudentTaskPriority priority={task.priority} size="sm" />
              </>
            )}
            {studentStage ? (
              <span className="text-sm text-text-secondary">
                · {studentStage}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-3 sm:px-5">
      <div className="flex items-start gap-2.5">
        {canEdit ? (
          <TaskCardQuickStatusButton
            status={task.status}
            overdue={deadlineStatus.tone === "overdue"}
            onPress={() =>
              onUpdateTask({ status: getNextQuickStatus(task.status) })
            }
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <StudentInlineEditableText
            value={task.title}
            onCommit={(title) => onUpdateTask({ title })}
            canEdit={canEdit}
            strikethrough={task.status === "done" || task.status === "canceled"}
            textClassName="text-lg leading-6 font-semibold sm:text-xl sm:leading-7"
            className="-mx-2 min-w-0"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {canEdit ? (
              <>
                <StudentTaskStatusSelect
                  taskTitle={task.title}
                  status={task.status}
                  onChange={(status) => onUpdateTask({ status })}
                />
                <StudentTaskPrioritySelect
                  taskTitle={task.title}
                  priority={task.priority}
                  onChange={(priority) => onUpdateTask({ priority })}
                />
              </>
            ) : (
              <>
                <StudentTaskStatusBadge status={task.status} size="sm" />
                <StudentTaskPriority priority={task.priority} size="sm" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getNextQuickStatus(
  status: StudentTaskItem["status"],
): StudentTaskItem["status"] {
  return status === "done" || status === "canceled" ? "todo" : "done";
}
