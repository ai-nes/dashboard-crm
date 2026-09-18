import {
  ClockThree,
  FileTextMultiple,
  Message1,
  Phone,
} from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { SaleTask } from "@/services/api/sale";

import { formatTaskDeadline } from "./formatters";

const taskTypePresentation: Record<
  SaleTask["type"],
  { label: string; color: "primary" | "warning" | "sky" | "gray" }
> = {
  call: { label: "Gọi điện", color: "primary" },
  document: { label: "Hồ sơ", color: "warning" },
  message: { label: "Tin nhắn", color: "sky" },
  other: { label: "Khác", color: "gray" },
};

const priorityPresentation: Record<
  SaleTask["priority"],
  { label: string; color: "primary" | "warning" | "gray" }
> = {
  High: { label: "Ưu tiên cao", color: "primary" },
  Medium: { label: "Ưu tiên vừa", color: "warning" },
  Low: { label: "Ưu tiên thấp", color: "gray" },
};

const statusPresentation: Record<
  SaleTask["status"],
  { label: string; color: "gray" | "sky" | "success" | "warning" }
> = {
  Backlog: { label: "Chưa xếp lịch", color: "gray" },
  Todo: { label: "Chưa làm", color: "warning" },
  "In Progress": { label: "Đang làm", color: "sky" },
  Done: { label: "Hoàn tất", color: "success" },
  Canceled: { label: "Đã hủy", color: "gray" },
};

interface PriorityTaskListProps {
  tasks: SaleTask[];
  onOpenTask: (task: SaleTask) => void;
  timezone: string;
  referenceDate: string;
  emptyMessage: string;
}

function TaskIcon({ task }: { task: SaleTask }) {
  if (task.type === "call") return <Phone size={17} aria-hidden="true" />;
  if (task.type === "document")
    return <FileTextMultiple size={17} aria-hidden="true" />;
  return <Message1 size={17} aria-hidden="true" />;
}

export default function PriorityTaskList({
  tasks,
  onOpenTask,
  timezone,
  referenceDate,
  emptyMessage,
}: PriorityTaskListProps) {
  if (tasks.length === 0) {
    return <p className="py-6 text-sm text-text-tertiary">{emptyMessage}</p>;
  }

  return (
    <div className="w-full min-w-0 divide-y divide-card-border">
      {tasks.map((task) => {
        const type = taskTypePresentation[task.type];
        const priority = priorityPresentation[task.priority];
        const status = statusPresentation[task.status];

        return (
          <article key={task.id} className="min-w-0 py-1">
            <Button
              type="button"
              variant="ghost"
              appearance="ghost"
              onPress={() => onOpenTask(task)}
              aria-label={`Xem chi tiết công việc: ${task.title} · ${task.studentName}`}
              className="group h-auto w-full cursor-pointer flex-col items-start gap-3 rounded-lg px-0 py-2.5 text-left transition-colors hover:bg-card-background hover:text-text-primary active:bg-background-soft-50 focus-visible:ring-2 focus-visible:ring-primary-500 sm:flex-row sm:items-center"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${type.color === "warning" ? "bg-badge-warning-background text-warning-500" : type.color === "sky" ? "bg-badge-sky-background text-info-500" : type.color === "primary" ? "bg-primary-50 text-primary-500" : "bg-background-soft-100 text-text-secondary"}`}
                aria-hidden="true"
              >
                <TaskIcon task={task} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700">
                    {task.title}
                  </h3>
                  <Badge color={type.color} size="sm">
                    {type.label}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  <span className="font-medium text-text-primary">
                    {task.studentName}
                  </span>
                  <span
                    className="px-1.5 text-text-tertiary"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  {task.context ?? "Chưa có ghi chú cho công việc này."}
                </p>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:w-52 sm:shrink-0 sm:justify-end">
                <Badge color={priority.color} size="sm">
                  {priority.label}
                </Badge>
                <Badge color={status.color} size="sm">
                  {status.label}
                </Badge>
                <span
                  className={`inline-flex w-full items-center gap-1 text-xs font-semibold sm:w-auto ${task.isOverdue ? "text-badge-error-text" : "text-text-secondary"}`}
                >
                  <ClockThree size={13} aria-hidden="true" />
                  {task.isOverdue ? "Quá hạn · " : "Hạn · "}
                  {formatTaskDeadline(task.dueAt, timezone, referenceDate)}
                </span>
              </div>
            </Button>
          </article>
        );
      })}
    </div>
  );
}
