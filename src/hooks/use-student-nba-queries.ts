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
  type NbaApiRequestOptions,
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

export function useDecideNbaRecommendation(
  options: NbaApiRequestOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation<NbaDecisionResponse, Error, NbaDecisionRequest>({
    mutationFn: (request) => decideNbaRecommendation(request, options),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentNbaKeys.all });
    },
  });
}

export function useRunStudentNbaEvaluation(
  options: NbaApiRequestOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation<
    NbaEvaluationRunResponse,
    Error,
    { studentId: string; idempotencyKey?: string }
  >({
    mutationFn: (request) => runStudentNbaEvaluation(request, options),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentNbaKeys.all });
    },
  });
}
