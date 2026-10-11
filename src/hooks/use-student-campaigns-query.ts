"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudentCampaigns } from "@/services/api/student-campaigns";

export function useStudentCampaignsQuery(
  studentId: string,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["student-campaigns", studentId, page],
    queryFn: ({ signal }) => getStudentCampaigns(studentId, page, signal),
    enabled: Boolean(studentId) && enabled,
    staleTime: 0,
    retry: false,
  });
}
