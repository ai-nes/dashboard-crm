"use client";

import { Check, ChevronDown } from "@tailgrids/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import type { StudentStatus } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format-date";
import { studentStatusLabel, studentStatusOptions } from "./student-status";
import type { StudentStageBorderItem } from "./student-stage-border-model";

const stageColors: Record<StudentStatus, string> = {
  New: "bg-info-500",
  Attempting: "bg-warning-500",
  Connected: "bg-badge-cyan-icon-color",
  Qualified: "bg-badge-violet-icon-color",
  Registration: "bg-primary-500",
  "New Enter": "bg-success-500",
  Disqualified: "bg-error-500",
};

interface StudentStageBorderItemProps {
  item: StudentStageBorderItem;
  isLoading: boolean;
  hasError: boolean;
}

export default function StudentStageBorderSegment({
  item,
  isLoading,
  hasError,
}: StudentStageBorderItemProps) {
  const { status, state, event } = item;
  const label = studentStatusLabel[status];
  const stateLabel =
    state === "current" ? "Hiện tại" : state === "past" ? "Đã qua" : "Chưa tới";
  const previous = studentStatusOptions.includes(
    event?.oldValue as StudentStatus,
  )
    ? studentStatusLabel[event?.oldValue as StudentStatus]
    : null;

  return (
    <li className="min-w-0 flex-1">
      <Tooltip placement="bottom">
        <TooltipTrigger
          type="button"
          aria-label={`${label} · ${stateLabel}`}
          aria-current={state === "current" ? "step" : undefined}
          className="group relative flex min-h-11 w-full min-w-0 cursor-help items-start justify-center px-1 pb-1 pt-3 text-center outline-none focus-visible:bg-background-soft-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-button-primary-focus-ring"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-0 h-1 origin-top transition-transform duration-150 group-hover:scale-y-150 group-focus-visible:scale-y-150 motion-reduce:transition-none",
              state === "future"
                ? "bg-background-soft-200"
                : stageColors[status],
            )}
          />
          <span
            className={cn(
              "flex min-w-0 items-start justify-center gap-1 text-[10px] leading-4 sm:text-xs",
              state === "current"
                ? "font-semibold text-text-primary"
                : "text-text-secondary",
            )}
          >
            {state === "past" && (
              <Check
                size={12}
                aria-hidden="true"
                className="mt-0.5 hidden shrink-0 sm:block"
              />
            )}
            {state === "current" && (
              <ChevronDown
                size={12}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
            )}
            <span className="min-w-0 break-words">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="z-50 block w-64 max-w-[calc(100vw-2rem)] p-3 text-xs font-normal shadow-none">
          <p className="font-semibold">
            {label} · {stateLabel}
          </p>
          {isLoading ? (
            <p className="mt-2">Đang tải lịch sử chuyển giai đoạn…</p>
          ) : hasError ? (
            <p className="mt-2">Chưa tải được lịch sử. Vui lòng thử lại sau.</p>
          ) : event ? (
            <div className="mt-2 space-y-1.5">
              {previous && (
                <p>
                  {previous} → {label}
                </p>
              )}
              <p>
                {state === "future" ? "Lần gần nhất từng tới" : "Chuyển lúc"}:{" "}
                {formatDateTime(event.occurredAt, "Chưa rõ thời gian")}
              </p>
              <p className="break-words">
                Cập nhật bởi:{" "}
                {event.ownerFullName || event.owner || "Chưa rõ người cập nhật"}
              </p>
            </div>
          ) : (
            <p className="mt-2">
              {state === "future"
                ? "Học sinh chưa tới giai đoạn này theo tiến trình hiện tại."
                : "Không có mốc chuyển giai đoạn trong lịch sử đã tải."}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
