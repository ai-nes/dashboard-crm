"use client";

import { Check } from "@tailgrids/icons";

import { StudentTaskPrioritySelect, StudentTaskStatusSelect } from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-task-selects";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
} from "@/services/api/crm-tasks";
import type {
  StudentPriority,
  StudentTaskItem,
} from "@/services/api/students/types";
import { cn } from "@/utils/cn";

import {
  getSegmentTaskDeadlineStatus,
  SEGMENT_TASK_PRIORITY_COLOR,
  SEGMENT_TASK_PRIORITY_LABEL,
  SEGMENT_TASK_STATUS_COLOR,
  SEGMENT_TASK_STATUS_LABEL,
} from "./segment-task-utils";

interface SegmentTaskCardHeroProps {
  task: CRMTask;
  canUpdate: boolean;
  isActionPending: boolean;
  compact?: boolean;
  onToggleStatus: (task: CRMTask) => void;
  onStatusChange: (status: CRMTaskStatus) => void;
  onPriorityChange: (priority: CRMTaskPriority) => void;
}

export default function SegmentTaskCardHero({
  task,
  canUpdate,
  isActionPending,
  compact = false,
  onToggleStatus,
  onStatusChange,
  onPriorityChange,
}: SegmentTaskCardHeroProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-2.5",
        compact ? "px-4 py-3.5 sm:px-5" : "px-4 pt-4 pb-3 sm:px-5",
      )}
    >
      <Button
        variant="success"
        appearance={task.status === "Done" ? "fill" : "outline"}
        iconOnly
        size="sm"
        isDisabled={isActionPending || !canUpdate}
        aria-label={
          task.status === "Done"
            ? `Đánh dấu task ${task.title} chưa hoàn thành`
            : task.status === "Canceled"
              ? `Khôi phục task ${task.title}`
              : `Đánh dấu task ${task.title} hoàn thành`
        }
        className={cn(
          "size-9 shrink-0 rounded-full",
          task.status !== "Done" && "bg-card-background text-text-secondary",
          getSegmentTaskDeadlineStatus(task).tone === "overdue" &&
            task.status !== "Done" &&
            "border-error-500 text-error-500",
        )}
        onPress={() => onToggleStatus(task)}
      >
        <Check size={17} aria-hidden="true" />
      </Button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold text-text-primary",
            compact
              ? "text-base leading-6"
              : "text-lg leading-6 sm:text-xl sm:leading-7",
            (task.status === "Done" || task.status === "Canceled") &&
              "text-text-secondary line-through",
          )}
        >
          {task.title}
        </p>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            compact ? "mt-1.5" : "mt-2",
          )}
        >
          {task.status ? (
            canUpdate ? (
              <StudentTaskStatusSelect
                taskTitle={task.title}
                status={crmStatusToStudentStatus(task.status)}
                onChange={(nextStatus) =>
                  onStatusChange(studentStatusToCrmStatus(nextStatus))
                }
              />
            ) : (
              <Badge
                color={SEGMENT_TASK_STATUS_COLOR[task.status]}
                size="sm"
                className="whitespace-nowrap font-semibold"
              >
                {SEGMENT_TASK_STATUS_LABEL[task.status]}
              </Badge>
            )
          ) : null}
          {task.priority ? (
            canUpdate ? (
              <StudentTaskPrioritySelect
                taskTitle={task.title}
                priority={crmPriorityToStudentPriority(task.priority)}
                onChange={(nextPriority) =>
                  onPriorityChange(studentPriorityToCrmPriority(nextPriority))
                }
              />
            ) : (
              <Badge
                color={SEGMENT_TASK_PRIORITY_COLOR[task.priority]}
                size="sm"
                prefixIcon={
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      task.priority === "High"
                        ? "bg-badge-error-icon-color"
                        : task.priority === "Medium"
                          ? "bg-badge-warning-icon-color"
                          : "bg-badge-neutral-icon-color",
                    )}
                    aria-hidden="true"
                  />
                }
                className="whitespace-nowrap font-semibold"
              >
                {SEGMENT_TASK_PRIORITY_LABEL[task.priority]}
              </Badge>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

function crmStatusToStudentStatus(
  status: CRMTaskStatus,
): StudentTaskItem["status"] {
  switch (status) {
    case "In Progress":
      return "in-progress";
    case "Done":
      return "done";
    case "Canceled":
      return "canceled";
    case "Backlog":
    case "Todo":
      return "todo";
  }
}

function studentStatusToCrmStatus(
  status: StudentTaskItem["status"],
): CRMTaskStatus {
  switch (status) {
    case "in-progress":
      return "In Progress";
    case "done":
      return "Done";
    case "canceled":
      return "Canceled";
    case "todo":
      return "Todo";
  }
}

function crmPriorityToStudentPriority(
  priority: CRMTaskPriority,
): StudentPriority {
  switch (priority) {
    case "High":
      return "Cao";
    case "Low":
      return "Thấp";
    case "Medium":
      return "Trung bình";
  }
}

function studentPriorityToCrmPriority(
  priority: StudentPriority,
): CRMTaskPriority {
  switch (priority) {
    case "Cao":
      return "High";
    case "Thấp":
      return "Low";
    case "Trung bình":
      return "Medium";
  }
}
