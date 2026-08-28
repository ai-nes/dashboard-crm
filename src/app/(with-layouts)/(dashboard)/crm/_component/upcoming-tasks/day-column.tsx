import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";
import type { DayColumnViewModel, TaskItemType } from "./types";

const TASK_TYPE_BADGE_COLOR: Record<TaskItemType, "primary" | "cyan" | "gray"> = {
  meeting: "primary",
  call: "cyan",
  task: "gray",
};

type DayColumnProps = {
  day: DayColumnViewModel;
};

export default function DayColumn({ day }: DayColumnProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col gap-3 rounded-lg border border-border-primary p-3",
        day.isToday && "border-brand-500 bg-badge-primary-background/40",
      )}
    >
      <div>
        <p
          className={cn(
            "text-xs leading-4 font-semibold text-text-secondary",
            day.isToday && "text-brand-500",
          )}
        >
          {day.dayLabel}
        </p>
        <p className="text-xs leading-4 text-text-tertiary">{day.dateLabel}</p>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {day.tasks.length === 0 ? (
          <p className="text-xs leading-4 text-text-tertiary">No items</p>
        ) : (
          day.tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-md border border-card-border bg-card-background p-2"
            >
              <Badge color={TASK_TYPE_BADGE_COLOR[task.type]} size="sm" className="mb-1">
                {task.type}
              </Badge>
              <p className="text-xs leading-4 font-medium text-text-primary">{task.title}</p>
              <p className="text-xs leading-4 text-text-tertiary">{task.timeLabel}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
