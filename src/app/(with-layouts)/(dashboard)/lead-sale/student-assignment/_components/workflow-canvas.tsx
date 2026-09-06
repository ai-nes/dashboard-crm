"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react";
import { ExpandArrow6 } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { useAssignment } from "./assignment-context";
import { workflowConnections as defaultWorkflowConnections } from "./data";
import { getWorkflowPhaseState } from "./mappings";
import WorkflowNode, { type AssignmentFlowNode } from "./workflow-node";
import type { AssignmentWorkflowConnection } from "@/services/api/lead-sale";
import "@xyflow/react/dist/style.css";

const connectionHandles: Record<
  string,
  {
    sourceHandle: string;
    targetHandle: string;
  }
> = {
  "input:validation": { sourceHandle: "out-right", targetHandle: "in-left" },
  "validation:classification": {
    sourceHandle: "out-right",
    targetHandle: "in-left",
  },
  "classification:matching": {
    sourceHandle: "out-right",
    targetHandle: "in-left",
  },
  "classification:review": {
    sourceHandle: "out-bottom",
    targetHandle: "in-left",
  },
  "matching:review": { sourceHandle: "out-bottom", targetHandle: "in-right" },
  "matching:assignment": {
    sourceHandle: "out-bottom",
    targetHandle: "in-top",
  },
  "review:assignment": { sourceHandle: "out-right", targetHandle: "in-left" },
};

function getConnectionLayout(connection: AssignmentWorkflowConnection) {
  const handles =
    connectionHandles[`${connection.source}:${connection.target}`] ??
    connectionHandles["input:validation"];
  return {
    ...connection,
    ...handles,
    label: connection.label ?? undefined,
  };
}

const canvasStyle = {
  "--xy-background-color-default": "var(--background-gray-secondary)",
  "--xy-edge-stroke-default": "var(--border-primary)",
  "--xy-attribution-background-color-default": "var(--card-background)",
} as CSSProperties;

export default function WorkflowCanvas() {
  const {
    workflowSteps,
    workflowConnections,
    currentPhaseId,
    selectStep,
    isRunningPipeline,
    pipelineRun,
  } = useAssignment();
  const nodeTypes = useMemo(() => ({ assignmentStep: WorkflowNode }), []);
  const instance = useRef<ReactFlowInstance<AssignmentFlowNode> | null>(null);
  const isRunning = isRunningPipeline;
  const hasRun = Boolean(pipelineRun);
  const nodes: AssignmentFlowNode[] = useMemo(
    () =>
      workflowSteps.map((step) => ({
        id: step.id,
        type: "assignmentStep",
        position: step.position,
        data: {
          step,
          metric: isRunning
            ? "Đang xử lý trên máy chủ"
            : `${step.metrics.successCount} thành công · ${step.metrics.warningCount + step.metrics.errorCount} cần xử lý`,
          highlighted: hasRun && step.status !== "idle",
          muted: false,
          active: false,
          completed: hasRun && step.status === "success",
          phaseState: getWorkflowPhaseState(step, currentPhaseId),
        },
      })),
    [workflowSteps, currentPhaseId, hasRun, isRunning],
  );

  const edges: Edge[] = useMemo(
    () =>
      (workflowConnections.length > 0
        ? workflowConnections
        : defaultWorkflowConnections
      ).map((rawConnection) => {
        const connection = getConnectionLayout(rawConnection);
        const warning = connection.target === "review";
        const sourceStep = workflowSteps.find(
          (step) => step.id === connection.source,
        );
        const targetStep = workflowSteps.find(
          (step) => step.id === connection.target,
        );
        const highlighted =
          hasRun &&
          sourceStep?.status === "success" &&
          targetStep?.status === "success";
        const labelOffsetY = -12;
        const color = highlighted
          ? "var(--primary-500)"
          : warning
            ? "var(--badge-warning-text)"
            : "var(--text-tertiary)";
        return {
          ...connection,
          id: `${connection.source}-${connection.target}`,
          type: "straight",
          animated: isRunning,
          selectable: false,
          focusable: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
            width: 16,
            height: 16,
          },
          style: {
            stroke: color,
            strokeWidth: 1.3,
            opacity: 0.9,
            strokeDasharray: warning ? "4 4" : undefined,
          },
          labelStyle: {
            fill: warning
              ? "var(--badge-warning-text)"
              : "var(--text-secondary)",
            fontSize: 11,
            transform: `translateY(${labelOffsetY}px)`,
          },
          labelBgStyle: {
            fill: "var(--background-gray-secondary)",
            transform: `translateY(${labelOffsetY}px)`,
          },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
        };
      }),
    [workflowConnections, workflowSteps, hasRun, isRunning],
  );

  return (
    <div className="relative h-[660px] min-w-0 border-t border-card-border bg-background-gray-secondary/50">
      <ReactFlow<AssignmentFlowNode>
        id="assignment-workflow-canvas"
        aria-label="Sơ đồ phân công học sinh tự động"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(flow) => {
          instance.current = flow;
        }}
        onNodeClick={(_, node) => selectStep(node.data.step.id)}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
        minZoom={0.65}
        maxZoom={1.2}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        panOnDrag={false}
        zoomOnPinch={false}
        style={canvasStyle}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-primary)"
        />
      </ReactFlow>
      <Button
        appearance="outline"
        size="sm"
        className="absolute bottom-3 left-3 gap-1.5 border-card-border bg-card-background text-text-secondary"
        onPress={() => instance.current?.fitView({ padding: 0.1, maxZoom: 1 })}
      >
        <ExpandArrow6 size={14} aria-hidden="true" />
        Vừa khung
      </Button>
    </div>
  );
}
