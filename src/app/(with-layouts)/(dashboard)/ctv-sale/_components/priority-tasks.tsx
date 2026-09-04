"use client";

import { Check, ChevronRight, ClockThree, Phone } from "@tailgrids/icons";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { priorityTasks } from "./data";
import type { PriorityTask } from "./data";

const taskToneStyles: Record<PriorityTask["tone"], { icon: string; badge: "primary" | "warning" | "sky" }> = {
  primary: { icon: "bg-primary-50 text-primary-500", badge: "primary" },
  warning: { icon: "bg-badge-warning-background text-warning-500", badge: "warning" },
  info: { icon: "bg-badge-sky-background text-info-500", badge: "sky" },
};

export default function PriorityTasks() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    );
  };

  return (
    <Card className="min-w-0 p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Việc cần xử lý</CardTitle>
            <Badge color="error" size="sm">2 quá hạn</Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Danh sách ưu tiên theo thời gian trong hôm nay.</p>
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
        {priorityTasks.map((task) => {
          const isCompleted = completedTasks.includes(task.id);
          const styles = taskToneStyles[task.tone];

          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 px-5 py-3.5 transition-colors sm:px-6 ${isCompleted ? "bg-background-soft-50" : "hover:bg-background-soft-50"}`}
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                {task.taskType === "Gọi lại" ? <Phone size={17} aria-hidden="true" /> : <ClockThree size={17} aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className={`truncate text-sm font-semibold ${isCompleted ? "text-text-tertiary line-through" : "text-text-primary"}`}>
                    {task.studentName}
                  </p>
                  <Badge color={styles.badge} size="sm">{task.taskType}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-text-tertiary">{task.detail}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isCompleted ? "text-text-tertiary" : "text-text-primary"}`}>
                  <ClockThree size={13} aria-hidden="true" />
                  {task.time}
                </span>
                <Button
                  size="xs"
                  variant={isCompleted ? "success" : "primary"}
                  appearance={isCompleted ? "ghost" : "outline"}
                  onPress={() => toggleTask(task.id)}
                  aria-label={`${isCompleted ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"}: ${task.studentName}`}
                  className="h-7 gap-1 px-2 text-[11px]"
                >
                  {isCompleted ? <Check size={13} aria-hidden="true" /> : null}
                  {isCompleted ? "Đã xong" : "Thực hiện"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
