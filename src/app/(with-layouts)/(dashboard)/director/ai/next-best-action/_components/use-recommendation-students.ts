"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { studentsKeys } from "@/hooks/use-students-queries";
import type { DirectorNbaRecommendation } from "@/services/api/nba";
import { getStudent360 } from "@/services/api/students";

export function useRecommendationStudents(
  recommendations: DirectorNbaRecommendation[],
): {
  studentNameById: ReadonlyMap<string, string>;
  studentCodeById: ReadonlyMap<string, string>;
} {
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
    const studentNameById = new Map<string, string>();
    const studentCodeById = new Map<string, string>();

    recommendations.forEach((recommendation) => {
      const name = recommendation.studentName?.trim();
      if (name) studentNameById.set(recommendation.studentId, name);
    });

    studentQueries.forEach((query, index) => {
      const studentId = studentIdsWithoutNames[index];
      const student = query.data?.student;
      const name = student?.name.trim();
      const code = student?.code.trim();
      if (studentId && name) studentNameById.set(studentId, name);
      if (studentId && code) studentCodeById.set(studentId, code);
    });

    return { studentNameById, studentCodeById };
  }, [recommendations, studentIdsWithoutNames, studentQueries]);
}
