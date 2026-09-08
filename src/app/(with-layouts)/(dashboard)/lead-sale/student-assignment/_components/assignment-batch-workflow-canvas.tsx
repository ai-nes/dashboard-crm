"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  useNodesState,
  type Edge,
  type OnNodeDrag,
  type ReactFlowInstance,
} from "@xyflow/react";
import { ExpandArrow6 } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { LeadAssignmentWorkflowConnection } from "@/services/api/lead-sale";
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
  connections: LeadAssignmentWorkflowConnection[];
  onSelect: (stepId: StepId) => void;
};

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

const workflowLayoutStorageKey = "lead-assignment-batch-workflow-layout";
const workflowLayoutAutosaveDelayMs = 10_000;

type WorkflowLayout = Partial<Record<StepId, { x: number; y: number }>>;

function getConnectionLayout(connection: LeadAssignmentWorkflowConnection) {
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
  connections,
  onSelect,
}: AssignmentBatchWorkflowCanvasProps) {
  const nodeTypes = useMemo(
    () => ({ assignmentBatchStep: AssignmentBatchWorkflowNode }),
    [],
  );
  const instance = useRef<ReactFlowInstance<AssignmentBatchFlowNode> | null>(
    null,
  );
  const hasFittedView = useRef(false);
  const autosaveTimeout = useRef<number | null>(null);
  const draggedNodeRef = useRef(false);
  const clearDraggedNodeTimeout = useRef<number | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [storedLayout] = useState<WorkflowLayout>(() => {
    try {
      const stored = window.localStorage.getItem(workflowLayoutStorageKey);
      return stored ? (JSON.parse(stored) as WorkflowLayout) : {};
    } catch {
      return {};
    }
  });
  const isRunning = steps.some((step) => step.status === "running");
  const hasActivity = hasBatch && steps.some((step) => step.status !== "idle");

  const saveLayout = useCallback((layout: WorkflowLayout) => {
    try {
      window.localStorage.setItem(workflowLayoutStorageKey, JSON.stringify(layout));
    } catch {
      // Layout persistence is best effort and must never interrupt dragging.
    }
  }, []);

  const scheduleLayoutAutosave = useCallback(
    (layout: WorkflowLayout) => {
      if (autosaveTimeout.current !== null) {
        window.clearTimeout(autosaveTimeout.current);
      }
      autosaveTimeout.current = window.setTimeout(
        () => saveLayout(layout),
        workflowLayoutAutosaveDelayMs,
      );
    },
    [saveLayout],
  );

  const getLayoutFromNodes = useCallback(
    (flowNodes: AssignmentBatchFlowNode[]): WorkflowLayout =>
      Object.fromEntries(
        flowNodes.map((node) => [
          node.id as StepId,
          { x: node.position.x, y: node.position.y },
        ]),
      ),
    [],
  );

  const onNodeDrag = useCallback<OnNodeDrag<AssignmentBatchFlowNode>>(
    (_, __, flowNodes) => {
      draggedNodeRef.current = true;
      scheduleLayoutAutosave(getLayoutFromNodes(flowNodes));
    },
    [getLayoutFromNodes, scheduleLayoutAutosave],
  );

  const onNodeDragStop = useCallback<OnNodeDrag<AssignmentBatchFlowNode>>(
    (_, __, flowNodes) => {
      draggedNodeRef.current = true;
      if (autosaveTimeout.current !== null) {
        window.clearTimeout(autosaveTimeout.current);
        autosaveTimeout.current = null;
      }
      saveLayout(getLayoutFromNodes(flowNodes));
      if (clearDraggedNodeTimeout.current !== null) {
        window.clearTimeout(clearDraggedNodeTimeout.current);
      }
      clearDraggedNodeTimeout.current = window.setTimeout(() => {
        draggedNodeRef.current = false;
      }, 500);
    },
    [getLayoutFromNodes, saveLayout],
  );

  const selectNode = useCallback(
    (stepId: StepId) => {
      if (draggedNodeRef.current) return;
      onSelect(stepId);
    },
    [onSelect],
  );

  useEffect(
    () => () => {
      if (autosaveTimeout.current !== null) {
        window.clearTimeout(autosaveTimeout.current);
      }
      if (clearDraggedNodeTimeout.current !== null) {
        window.clearTimeout(clearDraggedNodeTimeout.current);
      }
    },
    [],
  );

  const initialNodes: AssignmentBatchFlowNode[] = useMemo(
    () =>
      steps.map((step) => ({
        id: step.id,
        type: "assignmentBatchStep",
        position: storedLayout[step.id] ?? step.position,
        data: {
          step,
          metric:
            step.status === "running"
              ? "Đang xử lý…"
              : getBatchWorkflowStepMetric(step),
          highlighted: hasActivity && step.status !== "idle",
          active: selectedStep === step.id,
          processing: step.status === "running",
          completed: hasActivity && step.status === "success",
          phaseState: getBatchWorkflowPhaseState(step, currentPhaseId),
          onSelect: selectNode,
        },
      })),
    [
      currentPhaseId,
      hasActivity,
      selectNode,
      selectedStep,
      steps,
      storedLayout,
    ],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const step = steps.find((candidate) => candidate.id === node.id);
        if (!step) return node;

        return {
          ...node,
          data: {
            ...node.data,
            step,
            metric:
              step.status === "running"
                ? "Đang xử lý…"
                : getBatchWorkflowStepMetric(step),
            highlighted: hasActivity && step.status !== "idle",
            active: selectedStep === step.id,
            processing: step.status === "running",
            completed: hasActivity && step.status === "success",
            phaseState: getBatchWorkflowPhaseState(step, currentPhaseId),
            onSelect: selectNode,
          },
        };
      }),
    );
  }, [currentPhaseId, hasActivity, selectNode, selectedStep, setNodes, steps]);

  const edges: Edge[] = useMemo(
    () =>
      connections.map((rawConnection) => {
        const connection = getConnectionLayout(rawConnection);
        const warning = connection.target === "review";
        const sourceStep = steps.find((step) => step.id === connection.source);
        const targetStep = steps.find((step) => step.id === connection.target);
        const highlighted =
          hasActivity &&
          sourceStep?.status === "success" &&
          targetStep?.status === "success";
        const processing =
          isRunning &&
          sourceStep?.status === "success" &&
          targetStep?.status === "running";
        const color =
          processing || highlighted
            ? "var(--primary-500)"
            : warning
              ? "var(--badge-warning-text)"
              : "var(--text-tertiary)";
        return {
          ...connection,
          id: `${connection.source}-${connection.target}`,
          type: "smoothstep",
          pathOptions: { borderRadius: 16, offset: 28 },
          animated: processing && !reducedMotion,
          selectable: false,
          focusable: false,
          markerEnd: {
            type: MarkerType.Arrow,
            color,
            width: 14,
            height: 14,
          },
          style: {
            stroke: color,
            strokeWidth: processing ? 2 : 1.3,
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
    [connections, hasActivity, isRunning, reducedMotion, steps],
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
          if (!hasFittedView.current) {
            hasFittedView.current = true;
            requestAnimationFrame(() =>
              flow.fitView({ padding: 0.1, maxZoom: 1 }),
            );
          }
        }}
        onNodeClick={(_, node) => selectNode(node.data.step.id)}
        onNodesChange={onNodesChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        minZoom={0.4}
        maxZoom={1.2}
        nodesDraggable
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        panOnDrag
        nodeClickDistance={5}
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
