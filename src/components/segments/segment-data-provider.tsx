"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  useSegmentsQuery,
  useTransitionSegmentMutation,
  useVisibleSegmentsQuery,
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
  total: number;
  currentPage: number;
  totalPages: number;
  isFetching: boolean;
  search: string;
  status: SegmentStatus | "ALL";
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: SegmentStatus | "ALL") => void;
  serverPaginated: boolean;
} | null>(null);

const PAGE_SIZE = 8;

export function SegmentDataProvider({
  children,
  visibleStudentsOnly = false,
}: {
  children: ReactNode;
  /** Hide segments whose permission-scoped student result is empty. */
  visibleStudentsOnly?: boolean;
}) {
  const serverPaginated = !visibleStudentsOnly;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SegmentStatus | "ALL">("ALL");
  const allSegmentsQuery = useSegmentsQuery(
    {
      search,
      status: status === "ALL" ? undefined : status,
      start: (page - 1) * PAGE_SIZE,
      pageLength: PAGE_SIZE,
    },
    { enabled: serverPaginated },
  );
  const visibleSegmentsQuery = useVisibleSegmentsQuery(visibleStudentsOnly);
  const transitionMutation = useTransitionSegmentMutation();
  const segmentsQuery = visibleStudentsOnly
    ? visibleSegmentsQuery
    : allSegmentsQuery;
  const rawSegments = serverPaginated
    ? (allSegmentsQuery.data?.segments ?? [])
    : (visibleSegmentsQuery.data ?? []);
  const segments = rawSegments.map((segment) => toSegmentListItem(segment));
  const total = serverPaginated
    ? (allSegmentsQuery.data?.total ?? 0)
    : segments.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <SegmentDataContext.Provider
      value={{
        segments,
        isLoading: segmentsQuery.isLoading,
        error: segmentsQuery.error,
        refetch: segmentsQuery.refetch,
        transitionSegment: (payload) => transitionMutation.mutateAsync(payload),
        total,
        currentPage: page,
        totalPages,
        isFetching: segmentsQuery.isFetching,
        search,
        status,
        setPage,
        setSearch: (value) => {
          setSearch(value);
          setPage(1);
        },
        setStatus: (value) => {
          setStatus(value);
          setPage(1);
        },
        serverPaginated,
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
