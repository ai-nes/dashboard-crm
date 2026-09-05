"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ArrowRight } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import { useAssignment } from "./assignment-context";
import { stepIcons, toneClasses } from "./mappings";
import type { WorkflowStep } from "./types";

export type AssignmentFlowNode = Node<
  {
    step: WorkflowStep;
    metric: string;
    highlighted: boolean;
    muted: boolean;
    active: boolean;
    completed: boolean;
  },
  "assignmentStep"
>;

const sides = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

export default function WorkflowNode({ data }: NodeProps<AssignmentFlowNode>) {
  const { selectStep } = useAssignment();
  const Icon = stepIcons[data.step.id];
  return (
    <>
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
        aria-label={`${data.step.title}. ${data.metric}. Xem chi tiết bước`}
        onPress={() => selectStep(data.step.id)}
        className={cn(
          "block h-auto w-[234px] rounded-xl border border-card-border bg-card-background p-4 text-left text-text-primary shadow-xs transition-none hover:bg-card-background hover:text-text-primary",
          data.highlighted && "border-primary-400 ring-2 ring-primary-100",
          data.active && "border-primary-500 shadow-md ring-2 ring-primary-100",
          data.completed && !data.active && "border-badge-success-text/40",
          data.muted && "opacity-45",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              data.active
                ? "bg-badge-primary-background text-badge-primary-text animate-pulse"
                : toneClasses[data.step.tone],
            )}
          >
            <Icon size={17} aria-hidden="true" />
          </span>
          <span className="text-[13px] font-semibold">{data.step.title}</span>
        </div>
        <p className="mt-3 text-xs font-normal text-text-tertiary">
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
