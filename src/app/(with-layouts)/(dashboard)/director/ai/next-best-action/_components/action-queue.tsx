"use client";

import { ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

import { CONTROL_LEVEL_COLOR, CONTROL_LEVEL_LABEL } from "./control-level";
import type { ActionPriority, RecommendedAction } from "./types";

interface ActionQueueProps {
  actions: RecommendedAction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const statusStyles = {
  today: "text-warning-500",
  soon: "text-text-secondary",
  overdue: "text-error-500",
} as const;

const priorityLabels: Record<ActionPriority, string> = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
};

const priorityColors: Record<ActionPriority, "error" | "primary" | "gray"> = {
  high: "error",
  medium: "primary",
  low: "gray",
};

export default function ActionQueue({ actions, selectedId, onSelect }: ActionQueueProps) {
  if (actions.length === 0) {
    return <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><p className="text-sm font-semibold text-text-primary">Không có việc phù hợp</p><p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">Thử đổi bộ lọc để xem danh sách khác.</p></div>;
  }

  return (
    <ol className="divide-y divide-card-border">
      {actions.map((action) => {
        const selected = action.id === selectedId;

        return (
          <li key={action.id}>
            <button type="button" onClick={() => onSelect(action.id)} className={cn("grid w-full gap-3 px-4 py-4 text-left outline-none transition hover:bg-background-soft-50 focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring sm:grid-cols-[minmax(148px,0.85fr)_minmax(0,1.3fr)_auto] sm:items-center sm:gap-5 sm:px-5", selected && "bg-badge-primary-background/35 shadow-[inset_3px_0_0_var(--primary-500)]")} aria-current={selected ? "true" : undefined}>
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text" aria-hidden="true">{action.initials}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-text-primary">{action.studentName}</span>
                  <span className="mt-0.5 block truncate text-xs text-text-tertiary">{action.school}</span>
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-5 text-text-primary">{action.recommendation}</span>
                <span className="mt-1 block truncate text-xs text-text-secondary">
                  {action.state === "assigned" ? "Đã giao" : "Đề xuất"}: {action.suggestedAssignee}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-2 sm:justify-self-end">
                {action.state === "assigned" && <Badge color="success">Đã giao</Badge>}
                <Badge color={priorityColors[action.priority]}>{priorityLabels[action.priority]}</Badge>
                {action.controlLevel && (
                  <Badge color={CONTROL_LEVEL_COLOR[action.controlLevel]}>
                    {CONTROL_LEVEL_LABEL[action.controlLevel]}
                  </Badge>
                )}
                <span className={cn("inline-flex items-center gap-1 text-xs font-medium", statusStyles[action.status])}>
                  <ClockThree size={14} aria-hidden="true" />
                  {action.dueLabel}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
