"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  decideNbaRecommendation,
  getStudentNbaWorklist,
  runStudentNbaEvaluation,
  type NbaDecisionRequest,
  type NbaDecisionResponse,
  type NbaEvaluationRunResponse,
  type StudentNbaWorklistResponse,
} from "@/services/api/nba";

export const studentNbaKeys = {
  all: ["student-nba"] as const,
  worklist: (studentId: string) =>
    ["student-nba", "worklist", studentId] as const,
};

export function useStudentNbaWorklistQuery(
  studentId: string,
  options?: Omit<
    UseQueryOptions<StudentNbaWorklistResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<StudentNbaWorklistResponse, Error> {
  return useQuery({
    queryKey: studentNbaKeys.worklist(studentId),
    queryFn: () => getStudentNbaWorklist({ pageSize: 50, studentId }),
    ...options,
  });
}

export function useDecideNbaRecommendation() {
  const queryClient = useQueryClient();

  return useMutation<NbaDecisionResponse, Error, NbaDecisionRequest>({
    mutationFn: (request) => decideNbaRecommendation(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentNbaKeys.all });
    },
  });
}

export function useRunStudentNbaEvaluation() {
  const queryClient = useQueryClient();

  return useMutation<
    NbaEvaluationRunResponse,
    Error,
    { studentId: string; forceRerunReason?: string }
  >({
    mutationFn: (request) => runStudentNbaEvaluation(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentNbaKeys.all });
    },
  });
}
