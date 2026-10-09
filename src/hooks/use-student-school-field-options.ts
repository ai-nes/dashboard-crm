"use client";

import { useLimitInfinityScroll } from "./use-limit-infinity-scroll";
import { useState } from "react";

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
  const [search, setSearch] = useState("");
  const { limit, ...baseFilters } = params ?? {};
  const filters = { ...baseFilters, search: search || params?.search || undefined };
  const query = useLimitInfinityScroll({
    queryKey: studentSchoolFieldOptionsKeys.list(params ? { ...params, search: filters.search } : null),
    fetchPage: ({ limit }, signal) => getFieldOptions({ ...filters, limit } as GetFieldOptionsParams, signal),
    getItems: (response) => response.options,
    initialLimit: limit,
    enabled: Boolean(params) && enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { ...query, pagination: { ...query.pagination, onSearchChange: setSearch } };
}
