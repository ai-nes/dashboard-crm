"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { StudentTaskItem } from "@/services/api/students/types";

import StudentTaskCardActions from "./task-card/task-card-actions";
import TaskCardContext from "./task-card/task-card-context";
import TaskCardHeader from "./task-card/task-card-header";
import TaskCardHero from "./task-card/task-card-hero";
import TaskCardMetadata from "./task-card/task-card-metadata";
import {
  fromDateInputValue,
  getTaskDeadlineStatus,
  getTaskDueAt,
  toDateInputValue,
} from "./task-card/task-card-utils";

interface StudentTaskCardProps {
  task: StudentTaskItem;
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
  onDeleteTask?: (id: string) => void;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  aiInsight?: ReactNode;
  studentStage?: string;
}

export function isTaskOverdue(task: StudentTaskItem): boolean {
  if (task.status === "done" || task.status === "canceled") return false;
  const dueAt = getTaskDueAt(task);
  return dueAt !== null && dueAt < Date.now();
}

export default function StudentTaskCard({
  task,
  onUpdateTask,
  onDeleteTask,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
  aiInsight,
  studentStage,
}: StudentTaskCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState(() =>
    toDateInputValue(task.dueDate),
  );
  const [draftDueTime, setDraftDueTime] = useState(task.dueTime ?? "");
  const expanded = expandedProp ?? internalExpanded;
  const deadlineStatus = getTaskDeadlineStatus(task);

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  const updateTask = (updates: Partial<StudentTaskItem>) => {
    onUpdateTask(task.id, updates);
  };

  const startRescheduling = () => {
    setDraftDueDate(toDateInputValue(task.dueDate));
    setDraftDueTime(task.dueTime ?? "");
    setIsRescheduling(true);
  };

  const cancelRescheduling = () => {
    setDraftDueDate(toDateInputValue(task.dueDate));
    setDraftDueTime(task.dueTime ?? "");
    setIsRescheduling(false);
  };

  const saveRescheduling = () => {
    updateTask({
      dueDate: fromDateInputValue(draftDueDate),
      dueTime: draftDueTime || undefined,
    });
    setIsRescheduling(false);
  };

  const handleComplete = () => {
    updateTask({ status: task.status === "done" ? "todo" : "done" });
  };

  return (
    <article
      id={`student-task-${task.id}`}
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-sm"
    >
      <TaskCardHeader
        task={task}
        deadlineStatus={deadlineStatus}
        expanded={expanded}
        onToggle={toggleExpanded}
        onDelete={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
      />

      {!expanded ? (
        <div className="border-t border-border-primary">
          <TaskCardHero
            compact
            task={task}
            deadlineStatus={deadlineStatus}
            studentStage={studentStage}
            onUpdateTask={updateTask}
          />
        </div>
      ) : (
        <>
          <TaskCardHero
            task={task}
            deadlineStatus={deadlineStatus}
            studentStage={studentStage}
            onUpdateTask={updateTask}
          />
          <div className="space-y-5 border-t border-border-primary px-4 py-5 sm:px-5">
            <TaskCardMetadata
              task={task}
              deadlineStatus={deadlineStatus}
              isRescheduling={isRescheduling}
              draftDueDate={draftDueDate}
              draftDueTime={draftDueTime}
              onDraftDueDateChange={setDraftDueDate}
              onDraftDueTimeChange={setDraftDueTime}
              onStartRescheduling={startRescheduling}
            />
            <TaskCardContext notes={task.notes} onCommit={updateTask} />
            {aiInsight}
          </div>
          <StudentTaskCardActions
            isRescheduling={isRescheduling}
            canComplete={task.status !== "done"}
            onCancelRescheduling={cancelRescheduling}
            onSaveRescheduling={saveRescheduling}
            onComplete={handleComplete}
          />
        </>
      )}
    </article>
  );
}
