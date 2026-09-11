"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useSegmentsQuery,
  useTransitionSegmentMutation,
} from "@/hooks/use-segment-queries";
import type { SegmentStatus } from "@/services/api/segments";

import { toSegmentListItem, type SegmentListItem } from "./segment-list-types";

const SegmentDataContext = createContext<{
  segments: SegmentListItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  transitionSegment: (payload: {
    name: string;
    status: SegmentStatus;
    expectedRevision: number;
  }) => Promise<unknown>;
} | null>(null);

export function SegmentDataProvider({ children }: { children: ReactNode }) {
  const segmentsQuery = useSegmentsQuery();
  const transitionMutation = useTransitionSegmentMutation();
  const segments = (segmentsQuery.data ?? []).map((segment) =>
    toSegmentListItem(segment),
  );

  return (
    <SegmentDataContext.Provider
      value={{
        segments,
        isLoading: segmentsQuery.isLoading,
        error: segmentsQuery.error,
        refetch: segmentsQuery.refetch,
        transitionSegment: (payload) => transitionMutation.mutateAsync(payload),
      }}
    >
      {children}
    </SegmentDataContext.Provider>
  );
}

export function useSegmentData() {
  const context = useContext(SegmentDataContext);
  if (!context) throw new Error("useSegmentData requires SegmentDataProvider");
  return context;
}
