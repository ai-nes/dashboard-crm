"use client";

import { useQuery } from "@tanstack/react-query";

import { getLeadOptions } from "@/services/api/student-school-update";

export const leadMappingOptionsKeys = {
  all: ["lead-mapping-options"] as const,
};

export function useLeadMappingOptions(enabled = true) {
  return useQuery({
    queryKey: leadMappingOptionsKeys.all,
    queryFn: () => getLeadOptions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
