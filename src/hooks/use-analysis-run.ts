"use client";

import { useState } from "react";

import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";

import {
  getAnalysisRun,
  requestAnalysisRun,
  type AnalysisRunKind,
  type AnalysisRunRequest,
  type AnalysisRunSnapshot,
} from "@/services/api/analysis-runs";

export const analysisRunKeys = {
  all: ["analysis-runs"] as const,
  run: (kind: AnalysisRunKind, runId: string) => ["analysis-runs", kind, runId] as const,
};

interface AnalysisRunReference {
  runId: string;
  runKind: AnalysisRunKind;
}

function storageKey(kind: AnalysisRunKind, targetId: string): string {
  return `dashboard-analysis-run:${kind}:${encodeURIComponent(targetId.trim())}`;
}

function readRunReference(kind: AnalysisRunKind, targetId: string): AnalysisRunReference | null {
  if (typeof window === "undefined" || !targetId.trim()) return null;
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(storageKey(kind, targetId)) ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const reference = value as Partial<AnalysisRunReference>;
    return reference.runKind === kind && typeof reference.runId === "string" && reference.runId
      ? { runId: reference.runId, runKind: kind }
      : null;
  } catch {
    return null;
  }
}

function persistRunReference(kind: AnalysisRunKind, targetId: string, runId: string): void {
  if (typeof window === "undefined" || !targetId.trim()) return;
  try {
    window.sessionStorage.setItem(storageKey(kind, targetId), JSON.stringify({ runId, runKind: kind }));
  } catch {
    // Storage can be unavailable in private browsing; the current run remains available in mutation state.
  }
}

interface UseAnalysisRunResult {
  run: AnalysisRunSnapshot | null;
  request: (request: AnalysisRunRequest) => void;
  requestMutation: UseMutationResult<AnalysisRunSnapshot, Error, AnalysisRunRequest>;
  runQuery: UseQueryResult<AnalysisRunSnapshot, Error>;
}

export function useAnalysisRun(kind: AnalysisRunKind, targetId: string): UseAnalysisRunResult {
  const [runReference, setRunReference] = useState<AnalysisRunReference | null>(() => readRunReference(kind, targetId));

  const requestMutation = useMutation({
    mutationFn: (request: AnalysisRunRequest) => requestAnalysisRun(request),
    onSuccess: (run) => {
      setRunReference({ runId: run.runId, runKind: run.runKind });
      persistRunReference(kind, targetId, run.runId);
    },
  });
  const runQuery = useQuery({
    queryKey: runReference ? analysisRunKeys.run(runReference.runKind, runReference.runId) : analysisRunKeys.all,
    queryFn: () => getAnalysisRun(runReference!.runId, runReference!.runKind),
    // The new crm-agents endpoint settles the 360 report in the POST response.
    // A stored run is read once for history; Analyse now no longer starts a
    // webhook/poll loop.
    enabled: Boolean(runReference?.runId) && !requestMutation.data,
    refetchOnWindowFocus: true,
  });

  return {
    run: requestMutation.data ?? runQuery.data ?? null,
    request: (request) => requestMutation.mutate(request),
    requestMutation,
    runQuery,
  };
}
