import type { QueryClient } from "@tanstack/react-query";
import { studentsKeys } from "./use-students-queries";
import { studentScoreContextKeys } from "./use-student-score-context-query";

export async function refreshStudentAdmissionQueries(
  queryClient: QueryClient,
  studentId: string,
  queryStudentId = studentId,
) {
  const ids = new Set([studentId, queryStudentId]);
  await Promise.all([
    ...Array.from(ids).flatMap((id) => [
      queryClient.invalidateQueries({
        queryKey: studentsKeys.student360(id),
      }),
      queryClient.invalidateQueries({
        // Include every cached year, including the no-year query.
        queryKey: studentsKeys.studentHighSchoolScore(id).slice(0, 2),
      }),
      queryClient.invalidateQueries({
        queryKey: studentScoreContextKeys.detail(id),
      }),
    ]),
    queryClient.invalidateQueries({
      queryKey: studentsKeys.directorStudentsRoot,
    }),
    queryClient.invalidateQueries({
      queryKey: studentsKeys.assignedStudentsRoot,
    }),
  ]);
}
