"use client";

import { useState } from "react";
import type { SessionUser } from "@/services/api/auth";

import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
} from "@/services/api/crm-tasks";

import SegmentTaskCardDetails from "./segment-task-card-details";
import SegmentTaskCardHeader from "./segment-task-card-header";
import SegmentTaskCardHero from "./segment-task-card-hero";
import {
  getAssigneeInitials,
  getSegmentTaskDeadlineStatus,
} from "./segment-task-utils";

interface SegmentTaskCardProps {
  task: CRMTask;
  assignees: Pick<SessionUser, "name" | "full_name" | "email">[];
  canUpdate: boolean;
  canDelete: boolean;
  isActionPending: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onEdit: (task: CRMTask) => void;
  onDelete: (task: CRMTask) => void;
  onToggleStatus: (task: CRMTask) => void;
  onStatusChange: (task: CRMTask, status: CRMTaskStatus) => void;
  onPriorityChange: (task: CRMTask, priority: CRMTaskPriority) => void;
}

export default function SegmentTaskCard({
  task,
  assignees,
  canUpdate,
  canDelete,
  isActionPending,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onStatusChange,
  onPriorityChange,
}: SegmentTaskCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const deadlineStatus = getSegmentTaskDeadlineStatus(task);
  const assignee = assignees.find((user) => user.name === task.assignedTo);
  const resolvedName = assignee?.full_name?.trim() || assignee?.email?.trim();
  const assigneeName =
    resolvedName ||
    (task.assignedTo ? "Người dùng không khả dụng" : "Chưa phân công");
  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-sm">
      <SegmentTaskCardHeader
        task={task}
        assigneeName={assigneeName}
        deadlineStatus={deadlineStatus}
        canUpdate={canUpdate}
        canDelete={canDelete}
        isActionPending={isActionPending}
        expanded={expanded}
        onToggle={toggleExpanded}
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task)}
      />

      <SegmentTaskCardHero
        task={task}
        canUpdate={canUpdate}
        isActionPending={isActionPending}
        compact={!expanded}
        onToggleStatus={onToggleStatus}
        onStatusChange={(status) => onStatusChange(task, status)}
        onPriorityChange={(priority) => onPriorityChange(task, priority)}
      />

      {expanded ? (
        <SegmentTaskCardDetails
          task={task}
          assigneeName={assigneeName}
          assigneeInitials={getAssigneeInitials(resolvedName)}
          deadlineStatus={deadlineStatus}
        />
      ) : null}
    </article>
  );
}
