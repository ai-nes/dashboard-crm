"use client";

import { Calendar, Check, ChevronDown, ChevronRight } from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { StudentWorklistItem } from "@/services/api/student-worklist";
import { cn } from "@/utils/cn";

import { StudentTaskTypeBadge } from "./student-task-badges";

interface StudentActionItemCardProps {
  action: StudentWorklistItem;
  onStart: (action: StudentWorklistItem) => void;
  onOpenComplete: (action: StudentWorklistItem) => void;
  isStarting?: boolean;
  defaultExpanded?: boolean;
}

type DeadlineTone = "overdue" | "soon" | "upcoming" | "complete" | "unscheduled";

interface DeadlineStatus {
  tone: DeadlineTone;
  label: string;
  detail: string;
}

const EXECUTION_STATUS_LABEL: Record<string, string> = {
  planned: "Chưa bắt đầu",
  in_progress: "Đang thực hiện",
  completed: "Đã hoàn tất",
  failed: "Không hoàn thành",
  cancelled: "Đã hủy",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const PRIORITY_COLOR: Record<string, "error" | "warning" | "gray"> = {
  high: "error",
  medium: "warning",
  low: "gray",
};

function parseDueAtMs(dueAt: string | null): number | null {
  if (!dueAt) return null;
  const timestamp = new Date(dueAt.replace(" ", "T")).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, minutes)} phút`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.round(hours / 24)} ngày`;
}

function getDeadlineStatus(
  action: StudentWorklistItem,
  now = Date.now(),
): DeadlineStatus {
  const executionStatus = action.executionStatus || "planned";

  if (executionStatus === "completed") {
    return { tone: "complete", label: "Đã hoàn tất", detail: "Công việc đã được xử lý" };
  }
  if (executionStatus === "failed" || executionStatus === "cancelled") {
    return {
      tone: "unscheduled",
      label: EXECUTION_STATUS_LABEL[executionStatus],
      detail: "Công việc không còn cần xử lý",
    };
  }

  const dueAtMs = parseDueAtMs(action.dueAt);
  if (dueAtMs === null) {
    return { tone: "unscheduled", label: "Chưa đặt hạn", detail: "Chưa có thời điểm xử lý" };
  }

  const differenceInMinutes = Math.round((dueAtMs - now) / 60_000);
  if (differenceInMinutes < 0) {
    const elapsed = formatDuration(Math.abs(differenceInMinutes));
    return { tone: "overdue", label: `Quá hạn ${elapsed}`, detail: `Đã quá hạn ${elapsed}` };
  }
  if (differenceInMinutes <= 48 * 60) {
    const remaining = formatDuration(differenceInMinutes);
    return { tone: "soon", label: `Sắp đến hạn ${remaining}`, detail: `Còn ${remaining} để xử lý` };
  }
  const remaining = formatDuration(differenceInMinutes);
  return { tone: "upcoming", label: `Còn ${remaining}`, detail: `Còn ${remaining} để xử lý` };
}

function formatDueAt(dueAt: string | null): string {
  if (!dueAt) return "Chưa đặt hạn";
  const date = new Date(dueAt.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return dueAt;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOwnerInitials(owner: string | null): string {
  const initials = (owner ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "—";
}

function DeadlineBadge({ status }: { status: DeadlineStatus }) {
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
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <Calendar size={13} aria-hidden="true" />
      <span className="truncate">{status.label}</span>
    </span>
  );
}

export default function StudentActionItemCard({
  action,
  onStart,
  onOpenComplete,
  isStarting = false,
  defaultExpanded = true,
}: StudentActionItemCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const executionStatus = action.executionStatus || "planned";
  const isTerminal = ["completed", "failed", "cancelled"].includes(executionStatus);
  const canStart = action.permittedTransitions.includes("in_progress");
  const canComplete = action.permittedTransitions.includes("completed");
  const deadlineStatus = getDeadlineStatus(action);

  return (
    <article
      id={`student-task-${action.name}`}
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 bg-background-gray-primary px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
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
          <StudentTaskTypeBadge actionCode={action.actionType ?? undefined} size="sm" />
          <span className="hidden truncate font-normal text-text-secondary sm:inline">
            · {action.actionOwner || "Chưa phân công"}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <DeadlineBadge status={deadlineStatus} />
        </div>
      </div>

      <div className="px-4 pt-5 pb-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full border",
              isTerminal
                ? "border-success-500 bg-success-500 text-white"
                : "border-card-border bg-card-background text-text-secondary",
            )}
            aria-hidden="true"
          >
            <Check size={17} />
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "-mx-2 px-2 text-xl leading-7 font-semibold text-text-primary sm:text-2xl sm:leading-8",
                isTerminal && "text-text-tertiary line-through",
              )}
            >
              {action.objective}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge color={isTerminal ? "gray" : "blue"} size="md">
                {EXECUTION_STATUS_LABEL[executionStatus] || executionStatus}
              </Badge>
              <Badge
                color={PRIORITY_COLOR[action.priority] ?? "gray"}
                size="md"
                prefixIcon={
                  <span
                    className="size-2 shrink-0 rounded-full bg-current"
                    aria-hidden="true"
                  />
                }
              >
                {PRIORITY_LABEL[action.priority] || action.priority}
              </Badge>
              {action.outcome && (
                <Badge color="gray" size="md">
                  Kết quả:{" "}
                  {action.outcomeCodes.find((o) => o.value === action.outcome)
                    ?.label || action.outcome}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 border-t border-border-primary px-4 py-5 sm:px-5">
          <section
            aria-label="Thông tin công việc"
            className="grid gap-5 rounded-xl border border-border-primary bg-card-surface-area p-4 sm:grid-cols-3"
          >
            <div className="min-w-0">
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
                    {formatDueAt(action.dueAt)}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-text-secondary">Hạn xử lý</p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700"
                  aria-hidden="true"
                >
                  {getOwnerInitials(action.actionOwner)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base leading-6 font-semibold text-text-primary">
                    {action.actionOwner || "Chưa phân công"}
                  </p>
                  <p className="text-sm leading-5 text-text-secondary">Người phụ trách</p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-base leading-6 font-semibold text-text-primary">
                {action.origin || "—"}
              </p>
              <p className="mt-0.5 text-sm leading-5 text-text-secondary">Nguồn</p>
            </div>
          </section>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border-primary px-4 py-4 sm:px-5">
        {canStart ? (
          <Button
            size="md"
            variant="primary"
            onPress={() => onStart(action)}
            isDisabled={isStarting}
          >
            {isStarting ? "Đang bắt đầu…" : "Bắt đầu"}
          </Button>
        ) : (
          <Button
            size="md"
            variant="primary"
            onPress={() => onOpenComplete(action)}
            isDisabled={!canComplete}
          >
            <Check size={16} aria-hidden="true" />
            {canComplete ? "Hoàn tất" : "Công việc đã xử lý"}
          </Button>
        )}
      </footer>
    </article>
  );
}
