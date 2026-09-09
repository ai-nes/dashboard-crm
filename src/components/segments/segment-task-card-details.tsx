import type { ReactNode } from "react";

import type { CRMTask } from "@/services/api/crm-tasks";
import { cn } from "@/utils/cn";

import {
  formatSegmentTaskDate,
  formatSegmentTaskDateTime,
  getAssigneeInitials,
  type SegmentTaskDeadlineStatus,
} from "./segment-task-utils";

interface SegmentTaskCardDetailsProps {
  task: CRMTask;
  deadlineStatus: SegmentTaskDeadlineStatus;
}

export default function SegmentTaskCardDetails({
  task,
  deadlineStatus,
}: SegmentTaskCardDetailsProps) {
  return (
    <div className="space-y-4 border-t border-border-primary px-4 py-4 sm:px-5">
      {task.description ? (
        <section
          className="border-b border-border-primary pb-4"
          aria-label="Mô tả task"
        >
          <h3 className="mb-2 text-sm font-semibold text-text-primary">
            Mô tả
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {task.description}
          </p>
        </section>
      ) : null}

      <section
        aria-label="Thông tin task"
        className="grid gap-4 rounded-xl border border-border-primary bg-card-surface-area p-3 sm:grid-cols-2"
      >
        <div className="flex items-start gap-2">
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
          <div className="min-w-0">
            <p className="text-base leading-6 font-semibold text-text-primary">
              {formatSegmentTaskDate(task.dueDate)}
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
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700"
            aria-hidden="true"
          >
            {getAssigneeInitials(task.assignedTo)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base leading-6 font-semibold text-text-primary">
              {task.assignedTo || "Chưa phân công"}
            </p>
            <p className="text-sm leading-5 text-text-secondary">
              {task.assignedTo ? "Phụ trách task segment" : "Cần phân công"}
            </p>
          </div>
        </div>
      </section>

      <dl className="grid gap-4 border-t border-border-primary pt-4 text-sm sm:grid-cols-2">
        <MetadataItem label="Ngày bắt đầu">
          {formatSegmentTaskDate(task.startDate)}
        </MetadataItem>
        <MetadataItem label="Cập nhật gần nhất">
          {formatSegmentTaskDateTime(task.modified || task.creation)}
        </MetadataItem>
      </dl>
    </div>
  );
}

function MetadataItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="mt-1 font-medium text-text-primary">{children}</dd>
    </div>
  );
}
