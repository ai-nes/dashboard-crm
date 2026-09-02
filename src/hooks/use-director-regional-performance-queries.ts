"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getDirectorRegionalPerformance,
  type DirectorRegionalPerformanceParams,
} from "@/services/api/director-regional-performance";

export function useDirectorRegionalPerformanceQuery(
  params: DirectorRegionalPerformanceParams,
) {
  return useQuery({
    queryKey: ["director-regional-performance", params],
    queryFn: () => getDirectorRegionalPerformance(params),
  });
}
