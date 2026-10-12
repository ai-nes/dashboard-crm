import type { QueryClient } from "@tanstack/react-query";
import { studentsKeys } from "./use-students-queries";
import { studentAuditKeys } from "./use-student-audit-query";

/** Detail URLs can use business codes while mutations use internal UUIDs. */
export async function refreshStudentProfileQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: studentsKeys.student360Root }),
    queryClient.invalidateQueries({
      queryKey: studentsKeys.directorStudentsRoot,
    }),
    queryClient.invalidateQueries({
      queryKey: studentsKeys.assignedStudentsRoot,
    }),
    queryClient.invalidateQueries({ queryKey: studentAuditKeys.all }),
  ]);
}
