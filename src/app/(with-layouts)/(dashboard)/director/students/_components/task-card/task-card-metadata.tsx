import { ClockThree, Pencil1 } from "@tailgrids/icons";
import type { ReactNode } from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import type { StudentTaskItem } from "@/services/api/students/types";
import { cn } from "@/utils/cn";

import {
  formatTaskDeadline,
  getAssigneeInitials,
  type TaskDeadlineStatus,
} from "./task-card-utils";

interface TaskCardMetadataProps {
  task: StudentTaskItem;
  deadlineStatus: TaskDeadlineStatus;
  isRescheduling: boolean;
  draftDueDate: string;
  draftDueTime: string;
  onDraftDueDateChange: (value: string) => void;
  onDraftDueTimeChange: (value: string) => void;
  onStartRescheduling: () => void;
}

export default function TaskCardMetadata({
  task,
  deadlineStatus,
  isRescheduling,
  draftDueDate,
  draftDueTime,
  onDraftDueDateChange,
  onDraftDueTimeChange,
  onStartRescheduling,
}: TaskCardMetadataProps) {
  return (
    <section
      aria-label="Thông tin task"
      className="grid gap-4 rounded-xl border border-border-primary bg-card-surface-area p-3 sm:grid-cols-2"
    >
      <MetadataBlock>
        {isRescheduling ? (
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1.25fr)_minmax(7rem,0.75fr)]">
            <DatePickerField
              ariaLabel="Hạn xử lý"
              value={draftDueDate}
              onChange={onDraftDueDateChange}
              className="h-10 text-sm"
            />
            <div className="relative">
              <Input
                type="time"
                value={draftDueTime}
                onChange={(event) => onDraftDueTimeChange(event.target.value)}
                aria-label="Giờ xử lý"
                className="h-10 pr-9 text-sm"
              />
              <ClockThree
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-1.5">
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                deadlineStatus.tone === "overdue"
                  ? "bg-error-500"
                  : deadlineStatus.tone === "soon"
                    ? "bg-warning-500"
                    : deadlineStatus.tone === "complete"
                      ? "bg-success-500"
                      : "bg-text-200",
              )}
              aria-hidden="true"
            />
            <div className="group relative min-w-0 pr-8">
              <Button
                iconOnly
                size="xs"
                variant="ghost"
                appearance="ghost"
                aria-label="Đổi lịch xử lý"
                className="absolute top-0 right-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                onPress={onStartRescheduling}
              >
                <Pencil1 size={14} aria-hidden="true" />
              </Button>
              <p className="text-base leading-6 font-semibold text-text-primary">
                {task.dueDate ? formatTaskDeadline(task) : "Chưa đặt hạn"}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm leading-5",
                  deadlineStatus.tone === "overdue"
                    ? "font-medium text-error-500"
                    : deadlineStatus.tone === "soon"
                      ? "font-medium text-warning-700"
                      : deadlineStatus.tone === "complete"
                        ? "text-success-600"
                        : "text-text-secondary",
                )}
              >
                {deadlineStatus.detail}
              </p>
              {!task.dueDate ? (
                <Button
                  variant="ghost"
                  appearance="ghost"
                  size="xs"
                  className="mt-1 -ml-2"
                  onPress={onStartRescheduling}
                >
                  Đặt hạn xử lý
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </MetadataBlock>

      <MetadataBlock>
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700"
            aria-hidden="true"
          >
            {getAssigneeInitials(task.assignee)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base leading-6 font-semibold text-text-primary">
              {task.assignee || "Chưa phân công"}
            </p>
            <p className="text-sm leading-5 text-text-secondary">
              {task.assignee ? "Sales · Phụ trách task" : "Cần phân công"}
            </p>
          </div>
        </div>
      </MetadataBlock>
    </section>
  );
}

function MetadataBlock({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}
