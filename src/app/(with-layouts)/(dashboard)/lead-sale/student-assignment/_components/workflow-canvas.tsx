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
import { automationPath } from "./data";
import WorkflowNode, { type AssignmentFlowNode } from "./workflow-node";
import type { StepId } from "./types";
import "@xyflow/react/dist/style.css";

const connections: {
  source: StepId;
  target: StepId;
  sourceHandle: string;
  targetHandle: string;
  label?: string;
  labelOffsetY?: number;
}[] = [
  {
    source: "input",
    target: "validation",
    sourceHandle: "out-right",
    targetHandle: "in-left",
  },
  {
    source: "validation",
    target: "classification",
    sourceHandle: "out-right",
    targetHandle: "in-left",
    label: "Pool hợp lệ",
  },
  {
    source: "classification",
    target: "matching",
    sourceHandle: "out-right",
    targetHandle: "in-left",
    label: "Tier 1/2",
  },
  {
    source: "classification",
    target: "review",
    sourceHandle: "out-bottom",
    targetHandle: "in-left",
    label: "Tier 3/4 hoặc lỗi địa bàn",
  },
  {
    source: "matching",
    target: "review",
    sourceHandle: "out-bottom",
    targetHandle: "in-right",
    label: "Deferred · vào hàng đợi",
  },
  {
    source: "matching",
    target: "assignment",
    sourceHandle: "out-bottom",
    targetHandle: "in-top",
    label: "Tier 1/2 · gán thành công",
  },
  {
    source: "review",
    target: "assignment",
    sourceHandle: "out-right",
    targetHandle: "in-left",
    label: "Đã xử lý thủ công",
  },
];

const canvasStyle = {
  "--xy-background-color-default": "var(--background-gray-secondary)",
  "--xy-edge-stroke-default": "var(--border-primary)",
  "--xy-attribution-background-color-default": "var(--card-background)",
} as CSSProperties;

export default function WorkflowCanvas() {
  const { workflowSteps, selectStep, testRun } = useAssignment();
  const nodeTypes = useMemo(() => ({ assignmentStep: WorkflowNode }), []);
  const instance = useRef<ReactFlowInstance<AssignmentFlowNode> | null>(null);
  const path = automationPath;
  const isRunning = testRun.status === "running";
  const hasRun = testRun.status !== "idle";
  const activeStepId = isRunning ? path[testRun.stepIndex] : undefined;
  const nodes: AssignmentFlowNode[] = useMemo(
    () =>
      workflowSteps.map((step) => ({
        id: step.id,
        type: "assignmentStep",
        position: step.position,
        data: {
          step,
          metric:
            isRunning && activeStepId === step.id
              ? "Đang xử lý"
              : `${step.metrics.successCount} thành công · ${step.metrics.warningCount + step.metrics.errorCount} cần xử lý`,
          highlighted:
            hasRun &&
            path.includes(step.id) &&
            (!isRunning || path.indexOf(step.id) <= testRun.stepIndex),
          muted: isRunning ? path.indexOf(step.id) > testRun.stepIndex : false,
          active: activeStepId === step.id,
          completed: isRunning && path.indexOf(step.id) < testRun.stepIndex,
        },
      })),
    [workflowSteps, path, hasRun, isRunning, testRun.stepIndex, activeStepId],
  );

  const edges: Edge[] = useMemo(
    () =>
      connections.map((connection) => {
        const highlighted =
          hasRun &&
          path.some(
            (id, index) =>
              id === connection.source && path[index + 1] === connection.target,
          );
        const sourceIndex = path.indexOf(connection.source);
        const targetIndex = path.indexOf(connection.target);
        const active =
          isRunning &&
          sourceIndex === testRun.stepIndex &&
          targetIndex === testRun.stepIndex + 1;
        const visible =
          !isRunning || (sourceIndex >= 0 && sourceIndex <= testRun.stepIndex);
        const warning = connection.target === "review";
        const labelOffsetY = connection.labelOffsetY ?? -12;
        const color = highlighted
          ? "var(--primary-500)"
          : warning
            ? "var(--badge-warning-text)"
            : "var(--text-tertiary)";
        return {
          ...connection,
          id: `${connection.source}-${connection.target}`,
          type: "straight",
          animated: active,
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
            strokeWidth: highlighted ? 2 : 1.3,
            opacity: visible ? (path.length && !highlighted ? 0.55 : 0.9) : 0.2,
            strokeDasharray: active ? "6 4" : warning ? "4 4" : undefined,
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
    [path, hasRun, isRunning, testRun.stepIndex],
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
