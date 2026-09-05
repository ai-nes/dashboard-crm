"use client";

import { Check, ChevronRight, ClockThree, Phone } from "@tailgrids/icons";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { useUpdateCrmTaskMutation } from "@/hooks/use-crm-tasks-queries";
import type { CtvSalePriorityTask } from "@/services/api/ctv-sale";

import { formatDueTime } from "./formatters";

const taskToneStyles: Record<
  CtvSalePriorityTask["taskType"],
  { icon: string; badge: "primary" | "warning" | "sky" }
> = {
  call: { icon: "bg-primary-50 text-primary-500", badge: "primary" },
  "follow-up": {
    icon: "bg-badge-warning-background text-warning-500",
    badge: "warning",
  },
  message: { icon: "bg-badge-sky-background text-info-500", badge: "sky" },
  other: { icon: "bg-background-soft-100 text-text-secondary", badge: "sky" },
};

interface PriorityTasksProps {
  tasks: CtvSalePriorityTask[];
  overdueCount: number;
  timezone: string;
  onTaskCompleted: () => void;
}

export default function PriorityTasks({
  tasks,
  overdueCount,
  timezone,
  onTaskCompleted,
}: PriorityTasksProps) {
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const updateTask = useUpdateCrmTaskMutation();

  const completeTask = async (task: CtvSalePriorityTask) => {
    if (!task.id.startsWith("Task:")) return;
    setPendingTaskId(task.id);
    try {
      await updateTask.mutateAsync({
        name: task.id.slice("Task:".length),
        status: "Done",
      });
      onTaskCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể hoàn thành task.",
      );
    } finally {
      setPendingTaskId(null);
    }
  };

  return (
    <Card className="min-w-0 p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Việc cần xử lý</CardTitle>
            {overdueCount > 0 ? (
              <Badge color="error" size="sm">
                {overdueCount} quá hạn
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Danh sách ưu tiên theo thời gian trong hôm nay.
          </p>
        </div>
        <Link
          href="/ctv-sale/tasks"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem tất cả
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="divide-y divide-card-border">
        {tasks.length === 0 ? (
          <p className="px-5 py-8 text-sm text-text-tertiary sm:px-6">
            Không có task ưu tiên cần xử lý.
          </p>
        ) : (
          tasks.map((task) => {
            const styles = taskToneStyles[task.taskType];
            const canComplete = task.id.startsWith("Task:");
            const isPending = pendingTaskId === task.id;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-background-soft-50 sm:px-6"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                >
                  {task.taskType === "call" ? (
                    <Phone size={17} aria-hidden="true" />
                  ) : (
                    <ClockThree size={17} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {task.studentName}
                    </p>
                    <Badge color={styles.badge} size="sm">
                      {task.taskTypeLabel}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-text-tertiary">
                    {task.detail}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-primary">
                    <ClockThree size={13} aria-hidden="true" />
                    {formatDueTime(task.dueAt, timezone)}
                  </span>
                  {canComplete ? (
                    <Button
                      size="xs"
                      variant="primary"
                      appearance="outline"
                      onPress={() => completeTask(task)}
                      isDisabled={isPending}
                      aria-label={`Đánh dấu đã xong: ${task.studentName}`}
                      className="h-7 gap-1 px-2 text-[11px]"
                    >
                      {isPending ? (
                        "Đang lưu"
                      ) : (
                        <>
                          <Check size={13} aria-hidden="true" />
                          Xong
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link
                      href={`/ctv-sale/tasks?task=${encodeURIComponent(task.id)}`}
                      className="text-[11px] font-semibold text-primary-500"
                    >
                      Mở task
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
