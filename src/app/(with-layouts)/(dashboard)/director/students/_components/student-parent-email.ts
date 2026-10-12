import type { Student360Data } from "@/services/api/students/types";

export function getStudentParentEmail(data: Student360Data): string {
  return data.student.profileDetails?.contact?.email ?? "";
}
