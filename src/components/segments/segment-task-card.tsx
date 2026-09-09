"use client";

import { useState } from "react";

import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
} from "@/services/api/crm-tasks";

import SegmentTaskCardDetails from "./segment-task-card-details";
import SegmentTaskCardHeader from "./segment-task-card-header";
import SegmentTaskCardHero from "./segment-task-card-hero";
import {
  getSegmentTaskDeadlineStatus,
} from "./segment-task-utils";

interface SegmentTaskCardProps {
  task: CRMTask;
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
  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-sm">
      <SegmentTaskCardHeader
        task={task}
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
        <SegmentTaskCardDetails task={task} deadlineStatus={deadlineStatus} />
      ) : null}
    </article>
  );
}
