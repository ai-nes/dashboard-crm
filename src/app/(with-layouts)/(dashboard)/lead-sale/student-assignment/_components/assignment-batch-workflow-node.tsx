"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ArrowRight } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import {
  stepIcons,
  toneClasses,
  workflowPhaseStateColors,
  workflowPhaseStateLabels,
} from "../../_shared/student-assignment/mappings";
import type {
  StepId,
  WorkflowStep,
} from "../../_shared/student-assignment/types";
import type { BatchWorkflowPhaseState } from "../../_shared/lead-assignment-batch/batch-assignment-workflow-data";

export type AssignmentBatchFlowNode = Node<
  {
    step: WorkflowStep;
    metric: string;
    highlighted: boolean;
    active: boolean;
    processing: boolean;
    completed: boolean;
    phaseState: BatchWorkflowPhaseState;
    onSelect: (stepId: StepId) => void;
  },
  "assignmentBatchStep"
>;

const sides = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

export default function AssignmentBatchWorkflowNode({
  data,
}: NodeProps<AssignmentBatchFlowNode>) {
  const Icon = stepIcons[data.step.id];

  return (
    <>
      {data.step.id === "matching" && (
        <Handle
          id="out-review"
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          className="invisible"
          style={{ left: "25%" }}
        />
      )}
      {data.step.id === "review" && (
        <Handle
          id="in-review"
          type="target"
          position={Position.Top}
          isConnectable={false}
          className="invisible"
          style={{ left: "85%" }}
        />
      )}
      {Object.entries(sides).map(([id, position]) => (
        <Handle
          key={`in-${id}`}
          id={`in-${id}`}
          type="target"
          position={position}
          isConnectable={false}
          className="invisible"
        />
      ))}
      <Button
        appearance="ghost"
        aria-label={`${data.step.title}. Trạng thái: ${workflowPhaseStateLabels[data.phaseState]}. ${data.metric}. Xem chi tiết bước`}
        aria-busy={data.processing}
        onPress={() => data.onSelect(data.step.id)}
        className={cn(
          "block h-auto min-h-[184px] w-[234px] cursor-grab rounded-xl border border-card-border bg-card-background p-4 text-left text-text-primary shadow-xs transition-none active:cursor-grabbing hover:bg-card-background hover:text-text-primary",
          data.highlighted && "border-primary-400 ring-2 ring-primary-100",
          data.active && "border-primary-500 shadow-md ring-2 ring-primary-100",
          data.processing &&
            "border-primary-500 shadow-md ring-2 ring-primary-100",
          data.completed && !data.active && "border-badge-success-text/40",
        )}
      >
        <div className="mb-2 flex justify-end">
          <Badge
            color={workflowPhaseStateColors[data.phaseState]}
            className="text-[10px]"
          >
            {data.processing
              ? "Đang xử lý"
              : workflowPhaseStateLabels[data.phaseState]}
          </Badge>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              data.active || data.processing
                ? "motion-safe:animate-pulse bg-badge-primary-background text-badge-primary-text"
                : toneClasses[data.step.tone],
            )}
          >
            <Icon size={17} aria-hidden="true" />
          </span>
          <span className="text-[13px] font-semibold">{data.step.title}</span>
        </div>
        <p className="mt-3 min-h-8 whitespace-normal text-xs font-normal text-text-tertiary">
          {data.step.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-card-border pt-2.5">
          <span
            className={cn(
              "text-xs font-medium",
              data.step.tone === "warning"
                ? "text-badge-warning-text"
                : "text-text-secondary",
            )}
          >
            {data.metric}
          </span>
          <ArrowRight
            size={13}
            className="text-text-tertiary"
            aria-hidden="true"
          />
        </div>
      </Button>
      {Object.entries(sides).map(([id, position]) => (
        <Handle
          key={`out-${id}`}
          id={`out-${id}`}
          type="source"
          position={position}
          isConnectable={false}
          className="invisible"
        />
      ))}
    </>
  );
}
