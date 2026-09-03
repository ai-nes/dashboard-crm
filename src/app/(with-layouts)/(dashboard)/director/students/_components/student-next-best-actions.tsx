"use client";

import {
  ErrorCircle1,
  InfoTriangle,
} from "@tailgrids/icons";
import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useStudentWorklistActionsQuery } from "@/hooks/use-student-worklist-queries";
import type { StudentWorklistItem } from "@/services/api/student-worklist";
import type { Student360Data } from "@/services/api/students/types";

interface StudentNextBestActionsProps {
  analysisAction?: ReactNode;
  callAction?: ReactNode;
  data: Student360Data;
  studentId: string;
}

type BadgeColor = "gray" | "primary" | "error" | "warning" | "success";

const priorityLabels: Record<string, string> = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
};

export default function StudentNextBestActions({
  analysisAction,
  callAction,
  data,
  studentId,
}: StudentNextBestActionsProps) {
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useStudentWorklistActionsQuery(studentId, {
    enabled: Boolean(studentId.trim()),
  });
  const actions = response?.items ?? [];

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <section
        aria-busy={isLoading}
        aria-labelledby="student-next-action-heading"
        className="p-5 lg:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              id="student-next-action-heading"
              className="text-base font-semibold text-text-primary"
            >
              Hành động tiếp theo
            </h3>
          </div>
          {(callAction || analysisAction) && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {callAction}
              {analysisAction}
            </div>
          )}
        </div>

        {isLoading && <StudentNextBestActionSkeleton />}

        {!isLoading && isError && (
          <div
            className="mt-5 flex items-start gap-2.5 rounded-lg border border-error-200 bg-badge-error-background p-3 text-error-600"
            role="alert"
          >
            <ErrorCircle1
              className="mt-0.5 shrink-0"
              size={16}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">
                Chưa thể tải hành động tiếp theo.
              </p>
              <p className="mt-1 text-xs leading-5">
                {error.message || "Vui lòng thử lại sau."}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && actions.length === 0 && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-card-border bg-background-soft-50 p-3 text-text-secondary">
            <InfoTriangle
              className="mt-0.5 shrink-0 text-text-tertiary"
              size={16}
              aria-hidden="true"
            />
            <p className="text-sm leading-5">
              Chưa có NBA đang mở cho học sinh này.
            </p>
          </div>
        )}

        {!isLoading && !isError && actions.length > 0 && (
          <div
            aria-label="Danh sách hành động tiếp theo"
            className="mt-5 space-y-3"
            role="list"
          >
            {actions.map((action, index) => (
              <div key={`${action.name}-${index}`} role="listitem">
                <StudentNextBestActionContent action={action} data={data} />
              </div>
            ))}
          </div>
        )}
      </section>
    </Card>
  );
}

interface StudentNextBestActionContentProps {
  action: StudentWorklistItem;
  data: Student360Data;
}

function StudentNextBestActionContent({
  action,
  data,
}: StudentNextBestActionContentProps) {
  return (
    <article className="rounded-lg border border-card-border bg-background-soft-50 p-4 lg:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={stateColor(action)}>{stateLabel(action)}</Badge>
        <Badge color={priorityColor(action.priority)}>
          {priorityLabels[action.priority] ?? "Trung bình"}
        </Badge>
        {action.origin && <Badge color="gray">{action.origin}</Badge>}
      </div>

      <p className="mt-4 text-xs font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-300">
        {action.actionType || "Đề xuất tiếp theo"}
        <span className="text-text-tertiary normal-case">
          {` · ${data.student.name}`}
        </span>
      </p>
      <h4 className="mt-1.5 max-w-3xl text-lg leading-6 font-semibold text-text-primary text-pretty">
        {action.objective}
      </h4>

    </article>
  );
}

function stateLabel(action: StudentWorklistItem): string {
  if (action.isOverdue) return "Đã quá hạn";

  return (
    (
      {
        pending: "Theo lịch",
        "requires-review": "Cần xem xét",
        completed: "Đã hoàn tất",
        cancelled: "Đã hủy",
        rejected: "Đã từ chối",
        superseded: "Đã thay thế",
      } satisfies Record<string, string>
    )[action.state] ?? action.state
  );
}

function stateColor(action: StudentWorklistItem): BadgeColor {
  if (action.isOverdue || action.state === "rejected") return "error";
  if (action.state === "completed") return "success";
  if (["cancelled", "superseded"].includes(action.state)) return "gray";
  if (action.state === "requires-review") return "warning";
  return "primary";
}

function priorityColor(priority: string): BadgeColor {
  if (priority === "high") return "error";
  if (priority === "low") return "gray";
  return "primary";
}

function StudentNextBestActionSkeleton() {
  return (
    <div className="mt-5 space-y-3" role="status" aria-live="polite">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-full max-w-3xl" />
      <Skeleton className="h-7 w-4/5 max-w-2xl" />
    </div>
  );
}
