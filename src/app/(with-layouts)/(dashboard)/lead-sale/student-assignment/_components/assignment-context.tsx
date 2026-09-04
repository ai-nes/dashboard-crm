"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { automationPath, initialRecords } from "./data";
import type { AssignmentFilter, AssignmentRecord, StepId } from "./types";

type TestRunStatus = "idle" | "running" | "completed";

interface TestRun {
  status: TestRunStatus;
  stepIndex: number;
}

interface AssignmentContextValue {
  records: AssignmentRecord[];
  filter: AssignmentFilter;
  setFilter: (filter: AssignmentFilter) => void;
  inspectedId: string | null;
  inspect: (id: string | null) => void;
  selectedStep: StepId | null;
  selectStep: (step: StepId | null) => void;
  resolve: (
    id: string,
    ownerId: string,
    reason: string,
    region: string,
  ) => void;
  testRun: TestRun;
  startTest: () => void;
  stopTest: () => void;
}

const AssignmentContext = createContext<AssignmentContextValue | null>(null);

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(initialRecords);
  const [filter, setFilter] = useState<AssignmentFilter>("all");
  const [inspectedId, inspect] = useState<string | null>(null);
  const [selectedStep, selectStep] = useState<StepId | null>(null);
  const [testRun, setTestRun] = useState<TestRun>({
    status: "idle",
    stepIndex: -1,
  });

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

  const startTest = () => {
    inspect(null);
    setTestRun({ status: "running", stepIndex: -1 });
  };

  const stopTest = () => {
    setTestRun({ status: "idle", stepIndex: -1 });
  };

  const resolve = (
    id: string,
    ownerId: string,
    reason: string,
    region: string,
  ) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id && !record.ownerId
          ? {
              ...record,
              status: "assigned",
              ownerId,
              method: "manual",
              reason,
              region,
              score: undefined,
            }
          : record,
      ),
    );
    toast.success("Đã phân công trong bản thử", {
      description: "Thay đổi chỉ lưu trong phiên xem này.",
    });
  };

  return (
    <AssignmentContext.Provider
      value={{
        records,
        filter,
        setFilter,
        inspectedId,
        inspect,
        selectedStep,
        selectStep,
        resolve,
        testRun,
        startTest,
        stopTest,
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
