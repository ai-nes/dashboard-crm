"use client";

import { useLimitInfinityScroll } from "./use-limit-infinity-scroll";

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
  return useLimitInfinityScroll({
    queryKey: schoolDirectoryKeys.suggestions(query, filters),
    fetchPage: ({ limit }, signal) => searchSchoolDirectory(query, limit, filters, signal),
    getItems: (schools) => schools,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
