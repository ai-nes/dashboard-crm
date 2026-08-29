"use client";

import { ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

import type { RecommendedAction } from "./types";

interface ActionQueueProps {
  actions: RecommendedAction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const statusStyles = {
  today: "text-warning-500",
  soon: "text-text-secondary",
  overdue: "text-error-500",
};

export default function ActionQueue({ actions, selectedId, onSelect }: ActionQueueProps) {
  if (actions.length === 0) {
    return <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><p className="text-sm font-semibold text-text-primary">Không còn hành động cần phân công</p><p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">AI sẽ bổ sung đề xuất mới khi phát hiện tín hiệu cần theo dõi.</p></div>;
  }

  return <ol className="divide-y divide-card-border">
    {actions.map((action) => {
      const selected = action.id === selectedId;
      return <li key={action.id}><button type="button" onClick={() => onSelect(action.id)} className={cn("grid w-full gap-3 px-4 py-4 text-left outline-none transition hover:bg-background-soft-50 focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring sm:grid-cols-[minmax(148px,0.9fr)_minmax(0,1.25fr)_auto] sm:items-center sm:gap-5 sm:px-5", selected && "bg-badge-primary-background/35 shadow-[inset_3px_0_0_var(--primary-500)]")} aria-pressed={selected}><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text" aria-hidden="true">{action.initials}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-text-primary">{action.studentName}</span><span className="mt-0.5 block truncate text-xs text-text-tertiary">{action.school}</span></span></div><span className="min-w-0"><span className="block truncate text-sm font-medium text-text-primary">{action.recommendation}</span><span className="mt-1 block truncate text-xs text-text-secondary">{action.summary}</span></span><span className="flex items-center gap-2 sm:justify-self-end"><ClockThree size={15} className={statusStyles[action.status]} aria-hidden="true" /><span className={cn("text-xs font-medium", statusStyles[action.status])}>{action.dueLabel}</span><Badge color="gray" className="hidden xl:inline-flex">{action.suggestedAssignee}</Badge></span></button></li>;
    })}
  </ol>;
}
