"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudentCampaignHistory } from "@/services/api/student-campaigns";

export const studentCampaignHistoryKeys = {
  all: ["student-campaign-history"] as const,
  detail: (student: string) => ["student-campaign-history", student] as const,
};

export function useStudentCampaignHistoryQuery(
  studentId: string,
  enabled = true,
) {
  const student = studentId.trim();
  return useQuery({
    queryKey: studentCampaignHistoryKeys.detail(student),
    queryFn: () => getStudentCampaignHistory(student),
    enabled: Boolean(student) && enabled,
    staleTime: 60_000,
  });
}
