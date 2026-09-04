import { ArrowRight, ClockThree, FileTextMultiple, Message1, Phone } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { priorityTasks } from "./data";
import type { SaleTask } from "./data";

const taskToneStyles: Record<SaleTask["tone"], { icon: string; badge: "primary" | "warning" | "sky" }> = {
  primary: { icon: "bg-primary-50 text-primary-500", badge: "primary" },
  warning: { icon: "bg-badge-warning-background text-warning-500", badge: "warning" },
  sky: { icon: "bg-badge-sky-background text-info-500", badge: "sky" },
};

function TaskIcon({ task }: { task: SaleTask }) {
  if (task.title.includes("học phí")) return <Phone size={17} aria-hidden="true" />;
  if (task.title.includes("học bạ")) return <FileTextMultiple size={17} aria-hidden="true" />;
  return <Message1 size={17} aria-hidden="true" />;
}

export default function PriorityTasks() {
  return (
    <Card className="min-w-0 p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Việc cần xử lý hôm nay</CardTitle>
            <Badge color="warning" size="sm">2 ưu tiên cao</Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các task được sắp theo hạn xử lý và mức độ ưu tiên.</p>
        </div>
        <Link
          href="/sale/tasks"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem tất cả
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="divide-y divide-card-border">
        {priorityTasks.map((task) => {
          const styles = taskToneStyles[task.tone];

          return (
            <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-background-soft-50 sm:px-6">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                <TaskIcon task={task} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{task.studentName}</p>
                  <Badge color={styles.badge} size="sm">{task.title}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-text-tertiary">{task.context}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-primary">
                  <ClockThree size={13} aria-hidden="true" />
                  {task.schedule}
                </span>
                <Link
                  href={`/sale/tasks?task=${task.id}`}
                  className="inline-flex h-7 items-center justify-center rounded-lg bg-button-primary-background px-2.5 text-[11px] font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                  aria-label={`Thực hiện task ${task.title} cho ${task.studentName}`}
                >
                  Thực hiện
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
