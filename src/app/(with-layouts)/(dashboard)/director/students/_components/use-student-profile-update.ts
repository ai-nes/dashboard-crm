"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { studentsKeys } from "@/hooks/use-students-queries";
import {
  updateStudent,
  type StudentUpdateFields,
} from "@/services/api/student-school-update";

export function useStudentProfileUpdate(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fields: StudentUpdateFields) =>
      updateStudent(studentId, fields),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentsKeys.student360(studentId),
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.directorStudentsRoot,
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.assignedStudentsRoot,
        }),
      ]);
    },
  });
}
