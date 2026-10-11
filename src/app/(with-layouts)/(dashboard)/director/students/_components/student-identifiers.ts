import type { Student360Data } from "@/services/api/students/types";

export function getStudentInternalId(
  student:
    | Pick<Student360Data["student"], "id" | "studentId">
    | null
    | undefined,
): string {
  return student?.studentId?.trim() || student?.id?.trim() || "";
}
