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
import type { AssignmentWorkflowConnection } from "@/services/api/lead-sale";
import {
  getBatchWorkflowPhaseState,
  getBatchWorkflowStepMetric,
} from "../../_shared/lead-assignment-batch/batch-assignment-workflow-data";
import type {
  StepId,
  WorkflowStep,
} from "../../_shared/student-assignment/types";
import AssignmentBatchWorkflowNode, {
  type AssignmentBatchFlowNode,
} from "./assignment-batch-workflow-node";
import "@xyflow/react/dist/style.css";

type AssignmentBatchWorkflowCanvasProps = {
  steps: WorkflowStep[];
  currentPhaseId: StepId | null;
  selectedStep: StepId | null;
  hasBatch: boolean;
  onSelect: (stepId: StepId) => void;
};

const workflowConnections: AssignmentWorkflowConnection[] = [
  { source: "input", target: "validation", label: null },
  { source: "validation", target: "classification", label: "Đủ dữ liệu" },
  { source: "classification", target: "matching", label: "Đủ thông tin tuyến" },
  {
    source: "classification",
    target: "review",
    label: "Cần bổ sung / duplicate",
  },
  { source: "matching", target: "assignment", label: "Có quy tắc và sức chứa" },
  { source: "matching", target: "review", label: "Tạm hoãn hoặc lỗi" },
  { source: "review", target: "assignment", label: "Sau khi xử lý lại" },
];

const connectionHandles: Record<
  string,
  { sourceHandle: string; targetHandle: string }
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
    targetHandle: "in-top",
  },
  "matching:review": { sourceHandle: "out-review", targetHandle: "in-review" },
  "matching:assignment": {
    sourceHandle: "out-bottom",
    targetHandle: "in-top",
  },
  "review:assignment": { sourceHandle: "out-right", targetHandle: "in-left" },
};

const canvasStyle = {
  "--xy-background-color-default": "var(--background-gray-secondary)",
  "--xy-edge-stroke-default": "var(--border-primary)",
  "--xy-attribution-background-color-default": "var(--card-background)",
} as CSSProperties;

function getConnectionLayout(connection: AssignmentWorkflowConnection) {
  return {
    ...connection,
    ...(connectionHandles[`${connection.source}:${connection.target}`] ??
      connectionHandles["input:validation"]),
    label: connection.label ?? undefined,
  };
}

export default function AssignmentBatchWorkflowCanvas({
  steps,
  currentPhaseId,
  selectedStep,
  hasBatch,
  onSelect,
}: AssignmentBatchWorkflowCanvasProps) {
  const nodeTypes = useMemo(
    () => ({ assignmentBatchStep: AssignmentBatchWorkflowNode }),
    [],
  );
  const instance = useRef<ReactFlowInstance<AssignmentBatchFlowNode> | null>(
    null,
  );
  const isRunning = steps.some((step) => step.status === "running");
  const hasActivity = hasBatch && steps.some((step) => step.status !== "idle");

  const nodes: AssignmentBatchFlowNode[] = useMemo(
    () =>
      steps.map((step) => ({
        id: step.id,
        type: "assignmentBatchStep",
        position: step.position,
        data: {
          step,
          metric: getBatchWorkflowStepMetric(step),
          highlighted: hasActivity && step.status !== "idle",
          active: selectedStep === step.id,
          completed: hasActivity && step.status === "success",
          phaseState: getBatchWorkflowPhaseState(step, currentPhaseId),
          onSelect,
        },
      })),
    [currentPhaseId, hasActivity, onSelect, selectedStep, steps],
  );

  const edges: Edge[] = useMemo(
    () =>
      workflowConnections.map((rawConnection) => {
        const connection = getConnectionLayout(rawConnection);
        const warning = connection.target === "review";
        const sourceStep = steps.find((step) => step.id === connection.source);
        const targetStep = steps.find((step) => step.id === connection.target);
        const highlighted =
          hasActivity &&
          sourceStep?.status === "success" &&
          targetStep?.status === "success";
        const color = highlighted
          ? "var(--primary-500)"
          : warning
            ? "var(--badge-warning-text)"
            : "var(--text-tertiary)";
        return {
          ...connection,
          id: `${connection.source}-${connection.target}`,
          type: "smoothstep",
          pathOptions: { borderRadius: 16, offset: 28 },
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
            transform: "translateY(-12px)",
          },
          labelBgStyle: {
            fill: "var(--background-gray-secondary)",
            transform: "translateY(-12px)",
          },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
        };
      }),
    [hasActivity, isRunning, steps],
  );

  return (
    <div className="relative h-[560px] min-w-0 border-t border-card-border bg-background-gray-secondary/50">
      <ReactFlow<AssignmentBatchFlowNode>
        id="lead-assignment-batch-workflow-canvas"
        aria-label="Sơ đồ phân công Lead theo đợt"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(flow) => {
          instance.current = flow;
        }}
        onNodeClick={(_, node) => onSelect(node.data.step.id)}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
        minZoom={0.4}
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
