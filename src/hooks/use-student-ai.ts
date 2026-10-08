"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { AnalysisRunSnapshot } from "@/services/api/analysis-runs";
import {
  acceptNbaCard,
  closeStudentMemory,
  editStudentMemory,
  getStudentAi,
  listStudentMemory,
  rejectNbaCard,
  requestStudentAnalysis,
  type AiMemoryEdit,
  type AiMemoryItem,
  type StudentAiOverview,
} from "@/services/api/student-ai";
import { toAnalysisRun } from "@/services/api/student-ai/to-analysis-run";

export const studentAiKeys = {
  all: ["student-ai"] as const,
  overview: (studentId: string) => ["student-ai", "overview", studentId] as const,
  memory: (studentId: string) => ["student-ai", "memory", studentId] as const,
};

const isWorking = (overview: StudentAiOverview | undefined) =>
  overview?.state === "queued" || overview?.state === "running";

/** The stored analysis for a student; it is re-read every few seconds while crm-ai works. */
export function useStudentAi(
  studentId: string,
): UseQueryResult<StudentAiOverview, Error> {
  return useQuery({
    queryKey: studentAiKeys.overview(studentId),
    queryFn: () => getStudentAi(studentId),
    enabled: Boolean(studentId.trim()),
    refetchInterval: (query) => (isWorking(query.state.data) ? 3000 : false),
    refetchOnWindowFocus: true,
  });
}

interface StudentAnalysisRun {
  overview: StudentAiOverview | undefined;
  /** The analysis in the shape the 360 cards already render. */
  run: AnalysisRunSnapshot | null;
  isActive: boolean;
  request: () => void;
  requestMutation: UseMutationResult<unknown, Error, void>;
  query: UseQueryResult<StudentAiOverview, Error>;
}

/** "Phân tích": queue one analysis and follow it until crm-ai has stored the result. */
export function useStudentAnalysis(studentId: string): StudentAnalysisRun {
  const queryClient = useQueryClient();
  const query = useStudentAi(studentId);
  const requestMutation = useMutation<unknown, Error, void>({
    mutationFn: () => requestStudentAnalysis(studentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: studentAiKeys.overview(studentId) }),
  });
  const overview = query.data;
  return {
    overview,
    run: overview ? toAnalysisRun(overview) : null,
    isActive: isWorking(overview) || requestMutation.isPending,
    request: () => {
      if (!studentId.trim() || requestMutation.isPending || isWorking(overview)) {
        return;
      }
      requestMutation.mutate();
    },
    requestMutation,
    query,
  };
}

export function useStudentMemory(
  studentId: string,
): UseQueryResult<AiMemoryItem[], Error> {
  return useQuery({
    queryKey: studentAiKeys.memory(studentId),
    queryFn: () => listStudentMemory(studentId),
    enabled: Boolean(studentId.trim()),
  });
}

/** Edits and closes of a memory item; each one marks the analysis out of date. */
export function useStudentMemoryActions(studentId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: studentAiKeys.memory(studentId) }),
      queryClient.invalidateQueries({ queryKey: studentAiKeys.overview(studentId) }),
    ]);
  const edit = useMutation({
    mutationFn: (input: { item: AiMemoryItem } & AiMemoryEdit) =>
      editStudentMemory(studentId, input.item.id, {
        ...(input.text !== undefined ? { text: input.text } : {}),
        ...(input.due !== undefined ? { due: input.due } : {}),
        expectedUpdatedAt: input.item.updated_at,
      }),
    onSuccess: refresh,
  });
  const close = useMutation({
    mutationFn: (input: { item: AiMemoryItem; status: "done" | "contradicted" }) =>
      closeStudentMemory(studentId, input.item.id, input.status, input.item.updated_at),
    onSuccess: refresh,
  });
  return { edit, close };
}

/** Accept or reject a recommended action; accepting also creates a task. */
export function useNbaCardDecision(studentId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: studentAiKeys.overview(studentId) }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    ]);
  const accept = useMutation({
    mutationFn: (input: { cardId: string; due?: string }) =>
      acceptNbaCard(studentId, input.cardId, input.due),
    onSuccess: refresh,
  });
  const reject = useMutation({
    mutationFn: (input: { cardId: string; reason?: string }) =>
      rejectNbaCard(studentId, input.cardId, input.reason),
    onSuccess: refresh,
  });
  return { accept, reject };
}
