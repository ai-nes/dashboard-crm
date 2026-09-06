"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getFieldOptions,
  type GetFieldOptionsParams,
} from "@/services/api/student-school-update";

export const studentSchoolFieldOptionsKeys = {
  list: (params: GetFieldOptionsParams | null) =>
    ["student-school-field-options", params] as const,
};

export function useStudentSchoolFieldOptions(
  params: GetFieldOptionsParams | null,
  enabled = true,
) {
  return useQuery({
    queryKey: studentSchoolFieldOptionsKeys.list(params),
    queryFn: () => getFieldOptions(params as GetFieldOptionsParams),
    enabled: Boolean(params) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
