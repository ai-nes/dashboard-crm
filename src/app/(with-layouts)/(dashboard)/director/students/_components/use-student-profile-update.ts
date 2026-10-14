"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { refreshStudentProfileQueries } from "@/hooks/refresh-student-profile-queries";
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
      await refreshStudentProfileQueries(queryClient);
    },
  });
}
