"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { studentsKeys } from "@/hooks/use-students-queries";
import type { DirectorNbaRecommendation } from "@/services/api/nba";
import { getStudent360 } from "@/services/api/students";

export function useRecommendationStudentNames(
  recommendations: DirectorNbaRecommendation[],
): ReadonlyMap<string, string> {
  const studentIdsWithoutNames = useMemo(
    () =>
      Array.from(
        new Set(
          recommendations
            .filter((recommendation) => !recommendation.studentName)
            .map((recommendation) => recommendation.studentId),
        ),
      ),
    [recommendations],
  );

  const studentQueries = useQueries({
    queries: studentIdsWithoutNames.map((studentId) => ({
      queryKey: studentsKeys.student360(studentId),
      queryFn: () => getStudent360(studentId),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  return useMemo(() => {
    const names = new Map<string, string>();

    recommendations.forEach((recommendation) => {
      const name = recommendation.studentName?.trim();
      if (name) names.set(recommendation.studentId, name);
    });

    studentQueries.forEach((query, index) => {
      const name = query.data?.student.name?.trim();
      const studentId = studentIdsWithoutNames[index];
      if (studentId && name) names.set(studentId, name);
    });

    return names;
  }, [recommendations, studentIdsWithoutNames, studentQueries]);
}
