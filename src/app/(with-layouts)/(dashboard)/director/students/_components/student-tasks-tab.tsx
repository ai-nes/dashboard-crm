"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/tailgrids/core/input";
import type { StudentWorklistItem } from "@/services/api/student-worklist";

import StudentActionItemCard from "./student-action-item-card";
import StudentCompleteActionDialog from "./student-complete-action-dialog";

interface StudentTasksTabProps {
  actions: StudentWorklistItem[];
  isLoading?: boolean;
  startingActionName?: string | null;
  isCompleting?: boolean;
  initialTaskId?: string;
  onStart: (action: StudentWorklistItem) => void;
  onComplete: (
    action: StudentWorklistItem,
    input: { outcomeCode: string; outcomeNotes?: string },
  ) => Promise<void>;
}

interface ActionGroup {
  id: string;
  label: string;
  sortTime: number;
  actions: StudentWorklistItem[];
}

function parseDueAt(value: string | null): number {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const timestamp = new Date(value.replace(" ", "T")).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function groupActions(actions: StudentWorklistItem[]): ActionGroup[] {
  const groups = new Map<string, ActionGroup>();

  for (const action of actions) {
    const isTerminal = ["completed", "failed", "cancelled"].includes(
      action.executionStatus || "planned",
    );
    let id: string;
    let label: string;
    let sortTime: number;

    if (action.isOverdue && !isTerminal) {
      id = "overdue";
      label = "Quá hạn";
      sortTime = Number.MIN_SAFE_INTEGER;
    } else if (isTerminal) {
      id = "done";
      label = "Đã xử lý";
      sortTime = Number.MAX_SAFE_INTEGER - 1;
    } else if (!action.dueAt) {
      id = "unscheduled";
      label = "Chưa đặt hạn";
      sortTime = Number.MAX_SAFE_INTEGER;
    } else if (action.isToday) {
      id = "today";
      label = "Hôm nay";
      sortTime = parseDueAt(action.dueAt);
    } else {
      id = "upcoming";
      label = "Sắp tới";
      sortTime = parseDueAt(action.dueAt);
    }

    const existing = groups.get(id);
    if (existing) {
      existing.actions.push(action);
    } else {
      groups.set(id, { id, label, sortTime, actions: [action] });
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.sortTime - b.sortTime);
}

export default function StudentTasksTab({
  actions,
  isLoading = false,
  startingActionName,
  isCompleting = false,
  onStart,
  onComplete,
}: StudentTasksTabProps) {
  const [search, setSearch] = useState("");
  const [completingAction, setCompletingAction] =
    useState<StudentWorklistItem | null>(null);

  const filteredActions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return actions;
    return actions.filter(
      (action) =>
        action.objective.toLowerCase().includes(query) ||
        (action.actionType || "").toLowerCase().includes(query),
    );
  }, [actions, search]);

  const groups = useMemo(() => groupActions(filteredActions), [filteredActions]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Tìm theo nội dung công việc…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="py-2 text-xs text-text-tertiary">Đang tải công việc…</p>
      ) : filteredActions.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">
          Chưa có công việc nào phù hợp.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3
                  className={
                    group.id === "overdue"
                      ? "text-sm font-semibold text-error-500"
                      : "text-sm font-semibold text-text-secondary"
                  }
                >
                  {group.label}
                </h3>
                <span className="rounded-full bg-background-gray-secondary_alt px-2 py-0.5 text-xs font-medium text-text-tertiary">
                  {group.actions.length}
                </span>
                <span className="h-px flex-1 bg-card-border" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                {group.actions.map((action) => (
                  <StudentActionItemCard
                    key={action.name}
                    action={action}
                    onStart={onStart}
                    onOpenComplete={setCompletingAction}
                    isStarting={startingActionName === action.name}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <StudentCompleteActionDialog
        action={completingAction}
        onOpenChange={(open) => {
          if (!open) setCompletingAction(null);
        }}
        isSubmitting={isCompleting}
        onConfirm={async (input) => {
          if (!completingAction) return;
          await onComplete(completingAction, input);
          setCompletingAction(null);
        }}
      />
    </div>
  );
}
