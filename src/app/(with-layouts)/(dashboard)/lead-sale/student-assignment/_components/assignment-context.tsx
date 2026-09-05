"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  useResolveStudentAssignmentMutation,
  useStudentAssignmentDetailQuery,
  useStudentAssignmentWorkspaceQuery,
} from "@/hooks/use-student-assignment-queries";
import type {
  AssignmentDetailResponse,
  AssignmentWorkspaceResponse,
} from "@/services/api/lead-sale";
import { automationPath, workflowSteps as workflowDefinitions } from "./data";
import type {
  AssignmentFilter,
  AssignmentRecord,
  StepId,
  WorkflowStep,
} from "./types";

type TestRunStatus = "idle" | "running" | "completed";

interface TestRun {
  status: TestRunStatus;
  stepIndex: number;
}

interface AssignmentContextValue {
  records: AssignmentRecord[];
  filter: AssignmentFilter;
  setFilter: (filter: AssignmentFilter) => void;
  query: string;
  setQuery: (query: string) => void;
  pagination: AssignmentWorkspaceResponse["pagination"] | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  meta: AssignmentWorkspaceResponse["meta"] | null;
  summary: AssignmentWorkspaceResponse["summary"] | null;
  health: AssignmentWorkspaceResponse["health"] | null;
  workflowSteps: WorkflowStep[];
  detail: AssignmentDetailResponse | null;
  detailLoading: boolean;
  detailError: Error | null;
  inspectedId: string | null;
  inspect: (id: string | null) => void;
  selectedStep: StepId | null;
  selectStep: (step: StepId | null) => void;
  resolve: (
    id: string,
    ownerId: string,
    reason: string,
    region: string,
  ) => Promise<void>;
  isResolving: boolean;
  testRun: TestRun;
  startTest: () => void;
  stopTest: () => void;
  setPage: (page: number) => void;
}

const AssignmentContext = createContext<AssignmentContextValue | null>(null);

const toneByStatus: Record<WorkflowStep["status"], WorkflowStep["tone"]> = {
  idle: "neutral",
  running: "primary",
  success: "success",
  warning: "warning",
  error: "warning",
};

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function displayTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function toRecord(
  item: AssignmentWorkspaceResponse["items"][number],
): AssignmentRecord {
  return {
    id: item.studentId,
    name: item.name,
    initials: initials(item.name),
    school: item.school,
    region: item.region ?? "",
    interest: item.interest ?? "Chưa xác định",
    source: item.source ?? "Chưa xác định",
    time: displayTime(item.receivedAt),
    receivedAt: item.receivedAt,
    status: item.status,
    ownerId: item.owner?.id,
    ownerName: item.owner?.displayName,
    score: item.matchScore ?? undefined,
    method: item.method,
    reason: item.reason ?? undefined,
    revision: item.revision,
  };
}

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [filter, setFilterState] = useState<AssignmentFilter>("all");
  const [query, setQueryState] = useState("");
  const [page, setPageState] = useState(1);
  const [inspectedId, inspect] = useState<string | null>(null);
  const [selectedStep, selectStep] = useState<StepId | null>(null);
  const [testRun, setTestRun] = useState<TestRun>({
    status: "idle",
    stepIndex: -1,
  });

  const params = useMemo(
    () => ({
      filter,
      q: query.trim(),
      page,
      pageSize: 20,
      sort: "receivedAt" as const,
      order: "desc" as const,
      timezone: "Asia/Ho_Chi_Minh",
    }),
    [filter, page, query],
  );
  const workspaceQuery = useStudentAssignmentWorkspaceQuery(params);
  const detailQuery = useStudentAssignmentDetailQuery(
    inspectedId,
    workspaceQuery.data?.meta.admissionYear,
  );
  const resolveMutation = useResolveStudentAssignmentMutation();

  const records = useMemo(
    () => workspaceQuery.data?.items.map(toRecord) ?? [],
    [workspaceQuery.data],
  );
  const workflowSteps = useMemo(
    () =>
      workflowDefinitions.map((definition) => {
        const apiStep = workspaceQuery.data?.workflow.steps.find(
          (step) => step.id === definition.id,
        );
        return apiStep
          ? {
              ...definition,
              status: apiStep.status,
              metrics: apiStep.metrics,
              tone: toneByStatus[apiStep.status],
            }
          : definition;
      }),
    [workspaceQuery.data],
  );

  useEffect(() => {
    if (testRun.status !== "running") return;

    const timeout = window.setTimeout(
      () => {
        const lastStepIndex = automationPath.length - 1;
        if (testRun.stepIndex >= lastStepIndex) {
          setTestRun((current) => ({ ...current, status: "completed" }));
          toast.success("Chạy thử luồng hoàn tất", {
            description: "Đã mô phỏng đầy đủ các bước phân công học sinh.",
          });
          return;
        }
        setTestRun((current) => ({
          ...current,
          stepIndex: current.stepIndex + 1,
        }));
      },
      testRun.stepIndex < 0 ? 250 : 850,
    );
    return () => window.clearTimeout(timeout);
  }, [testRun]);

  const setFilter = (nextFilter: AssignmentFilter) => {
    setFilterState(nextFilter);
    setPageState(1);
  };

  const setQuery = (nextQuery: string) => {
    setQueryState(nextQuery);
    setPageState(1);
  };

  const resolve = async (
    id: string,
    ownerId: string,
    reason: string,
    region: string,
  ) => {
    const record = records.find((item) => item.id === id);
    if (!record) return;
    const idempotencyKey = `assign:${id}:${record.revision}:${ownerId}:${region}:${reason}`
      .trim()
      .replace(/[^A-Za-z0-9._:-]+/g, "-")
      .slice(0, 140);
    try {
      await resolveMutation.mutateAsync({
        studentId: id,
        ownerId,
        reason: reason.trim(),
        region: region.trim(),
        expectedRevision: record.revision,
        idempotencyKey:
          idempotencyKey.length >= 8
            ? idempotencyKey
            : `assign:${id}:${record.revision}`,
      });
      toast.success("Đã phân công thành công", {
        description: "Workspace đã được đồng bộ với dữ liệu mới.",
      });
    } catch (error) {
      toast.error("Không thể phân công học sinh", {
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      throw error;
    }
  };

  return (
    <AssignmentContext.Provider
      value={{
        records,
        filter,
        setFilter,
        query,
        setQuery,
        pagination: workspaceQuery.data?.pagination ?? null,
        isLoading: workspaceQuery.isLoading,
        isFetching: workspaceQuery.isFetching,
        error: workspaceQuery.error,
        meta: workspaceQuery.data?.meta ?? null,
        summary: workspaceQuery.data?.summary ?? null,
        health: workspaceQuery.data?.health ?? null,
        workflowSteps,
        detail: detailQuery.data ?? null,
        detailLoading: detailQuery.isLoading,
        detailError: detailQuery.error,
        inspectedId,
        inspect,
        selectedStep,
        selectStep,
        resolve,
        isResolving: resolveMutation.isPending,
        testRun,
        startTest: () => {
          inspect(null);
          setTestRun({ status: "running", stepIndex: -1 });
        },
        stopTest: () => setTestRun({ status: "idle", stepIndex: -1 }),
        setPage: (nextPage) => setPageState(Math.max(1, nextPage)),
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (!context) throw new Error("AssignmentProvider is required");
  return context;
}
