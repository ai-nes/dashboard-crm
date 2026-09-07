"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type {
  StudentPriority,
  StudentTaskItem,
} from "@/services/api/students/types";
import { cn } from "@/utils/cn";

import { taskStatusLabel } from "./student-task-badges";

type TaskStatus = StudentTaskItem["status"];

interface TaskSelectOption<T extends string> {
  value: T;
  label: string;
  triggerClassName: string;
  indicatorClassName?: string;
}

interface TaskValueSelectProps<T extends string> {
  value: T;
  options: readonly TaskSelectOption<T>[];
  ariaLabel: string;
  onChange: (value: T) => void;
  className?: string;
}

const statusOptions: readonly TaskSelectOption<TaskStatus>[] = [
  {
    value: "todo",
    label: taskStatusLabel.todo,
    triggerClassName:
      "bg-badge-neutral-background text-badge-neutral-text hover:bg-badge-neutral-background",
  },
  {
    value: "in-progress",
    label: taskStatusLabel["in-progress"],
    triggerClassName:
      "bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background",
  },
  {
    value: "done",
    label: taskStatusLabel.done,
    triggerClassName:
      "bg-badge-success-background text-badge-success-text hover:bg-badge-success-background",
  },
  {
    value: "canceled",
    label: taskStatusLabel.canceled,
    triggerClassName:
      "bg-badge-neutral-background text-badge-neutral-text hover:bg-badge-neutral-background",
  },
];

const priorityOptions: readonly TaskSelectOption<StudentPriority>[] = [
  {
    value: "Cao",
    label: "Cao",
    triggerClassName:
      "bg-badge-error-background text-badge-error-text hover:bg-badge-error-background",
    indicatorClassName: "bg-badge-error-icon-color",
  },
  {
    value: "Trung bình",
    label: "Trung bình",
    triggerClassName:
      "bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background",
    indicatorClassName: "bg-badge-warning-icon-color",
  },
  {
    value: "Thấp",
    label: "Thấp",
    triggerClassName:
      "bg-badge-neutral-background text-badge-neutral-text hover:bg-badge-neutral-background",
    indicatorClassName: "bg-badge-neutral-icon-color",
  },
];

export function StudentTaskStatusSelect({
  taskTitle,
  status,
  onChange,
  className,
}: {
  taskTitle: string;
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
}) {
  return (
    <TaskValueSelect
      value={status}
      options={statusOptions}
      ariaLabel={`Đổi trạng thái task ${taskTitle}`}
      onChange={onChange}
      className={className}
    />
  );
}

export function StudentTaskPrioritySelect({
  taskTitle,
  priority,
  onChange,
  className,
}: {
  taskTitle: string;
  priority: StudentPriority;
  onChange: (priority: StudentPriority) => void;
  className?: string;
}) {
  return (
    <TaskValueSelect
      value={priority}
      options={priorityOptions}
      ariaLabel={`Đổi mức ưu tiên task ${taskTitle}`}
      onChange={onChange}
      className={className}
    />
  );
}

function TaskValueSelect<T extends string>({
  value,
  options,
  ariaLabel,
  onChange,
  className,
}: TaskValueSelectProps<T>) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select
      value={value}
      onChange={(nextValue) => {
        if (nextValue !== null && nextValue !== undefined) {
          onChange(String(nextValue) as T);
        }
      }}
      aria-label={ariaLabel}
      className={cn("w-fit max-w-full", className)}
    >
      <SelectTrigger
        size="xs"
        className={cn(
          "h-6 min-h-6 max-w-full gap-1 rounded-full border-transparent px-2 py-0.5 text-xs font-semibold shadow-none",
          selectedOption?.triggerClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selectedOption?.indicatorClassName ? (
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                selectedOption.indicatorClassName,
              )}
              aria-hidden="true"
            />
          ) : null}
          <SelectValue className="truncate">
            {selectedOption?.label ?? value}
          </SelectValue>
        </span>
        <SelectIndicator className="size-3.5 text-current [&>svg]:size-3.5" />
      </SelectTrigger>
      <SelectContent className="min-w-40">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            id={option.value}
            textValue={option.label}
          >
            <span className="flex items-center gap-2">
              {option.indicatorClassName ? (
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    option.indicatorClassName,
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
