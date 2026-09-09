"use client";

import { useState } from "react";

import type { CRMTask } from "@/services/api/crm-tasks";

import SegmentTaskCardDetails from "./segment-task-card-details";
import SegmentTaskCardHeader from "./segment-task-card-header";
import SegmentTaskCardHero from "./segment-task-card-hero";
import {
  getSegmentTaskDeadlineStatus,
  SEGMENT_TASK_PRIORITY_LABEL,
  SEGMENT_TASK_STATUS_LABEL,
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
}: SegmentTaskCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const deadlineStatus = getSegmentTaskDeadlineStatus(task);
  const status = task.status
    ? SEGMENT_TASK_STATUS_LABEL[task.status]
    : "Chưa xác định";
  const priority = task.priority
    ? SEGMENT_TASK_PRIORITY_LABEL[task.priority]
    : null;

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
        status={status}
        priority={priority}
        canUpdate={canUpdate}
        isActionPending={isActionPending}
        compact={!expanded}
        onToggleStatus={onToggleStatus}
      />

      {expanded ? (
        <SegmentTaskCardDetails task={task} deadlineStatus={deadlineStatus} />
      ) : null}
    </article>
  );
}
