"use client";

import { useQuery } from "@tanstack/react-query";

import { searchSchoolDirectory } from "@/services/api/schools/school-directory-client";

interface SchoolDirectoryFilters {
  province?: string;
  ward?: string;
}

export const schoolDirectoryKeys = {
  suggestions: (query: string, filters: SchoolDirectoryFilters) =>
    ["school-directory", "suggestions", query, filters] as const,
};

export function useSchoolDirectoryQuery(
  query: string,
  filters: SchoolDirectoryFilters,
  enabled: boolean,
) {
  return useQuery({
    queryKey: schoolDirectoryKeys.suggestions(query, filters),
    queryFn: () => searchSchoolDirectory(query, 20, filters),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
