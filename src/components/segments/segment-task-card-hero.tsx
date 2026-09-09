"use client";

import { Check } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { CRMTask } from "@/services/api/crm-tasks";
import { cn } from "@/utils/cn";

import {
  getSegmentTaskDeadlineStatus,
  SEGMENT_TASK_PRIORITY_COLOR,
  SEGMENT_TASK_STATUS_COLOR,
} from "./segment-task-utils";

interface SegmentTaskCardHeroProps {
  task: CRMTask;
  status: string;
  priority: string | null;
  canUpdate: boolean;
  isActionPending: boolean;
  compact?: boolean;
  onToggleStatus: (task: CRMTask) => void;
}

export default function SegmentTaskCardHero({
  task,
  status,
  priority,
  canUpdate,
  isActionPending,
  compact = false,
  onToggleStatus,
}: SegmentTaskCardHeroProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-3",
        compact ? "px-4 py-4 sm:px-5" : "px-4 pt-5 pb-4 sm:px-5",
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
              : "text-xl leading-7 sm:text-2xl sm:leading-8",
            (task.status === "Done" || task.status === "Canceled") &&
              "text-text-secondary line-through",
          )}
        >
          {task.title}
        </p>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            compact ? "mt-2" : "mt-3",
          )}
        >
          {task.status ? (
            <Badge
              color={SEGMENT_TASK_STATUS_COLOR[task.status]}
              size="sm"
              className="whitespace-nowrap font-semibold"
            >
              {status}
            </Badge>
          ) : null}
          {priority && task.priority ? (
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
              {priority}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
