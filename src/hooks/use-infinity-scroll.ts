"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseInfinityScrollOptions<T> {
  pageSize?: number;
  enabled?: boolean;
  rootMargin?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

export interface UseInfinityScrollResult<T> {
  visibleItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  sentinelRef: (node: HTMLElement | null) => void;
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_ROOT_MARGIN = "0px 0px 120px 0px";

interface PaginationState {
  itemsKey: string;
  visibleCount: number;
}

export function useInfinityScroll<T>(
  items: readonly T[],
  {
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
    rootMargin = DEFAULT_ROOT_MARGIN,
    getItemKey,
  }: UseInfinityScrollOptions<T> = {},
): UseInfinityScrollResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemsKey = useMemo(
    () =>
      items
        .map((item, index) => String(getItemKey?.(item, index) ?? index))
        .join("\u0000"),
    [getItemKey, items],
  );
  const firstPageSize = Math.min(safePageSize, items.length);
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    itemsKey,
    visibleCount: firstPageSize,
  }));
  const visibleCount =
    pagination.itemsKey === itemsKey ? pagination.visibleCount : firstPageSize;

  const hasMore = visibleCount < items.length;
  const loadMore = useCallback(() => {
    setPagination((current) => {
      const currentCount =
        current.itemsKey === itemsKey ? current.visibleCount : firstPageSize;
      const nextCount = Math.min(currentCount + safePageSize, items.length);
      if (current.itemsKey === itemsKey && current.visibleCount === nextCount) {
        return current;
      }
      return { itemsKey, visibleCount: nextCount };
    });
  }, [firstPageSize, items.length, itemsKey, safePageSize]);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (
        !node ||
        !enabled ||
        !hasMore ||
        typeof IntersectionObserver === "undefined"
      ) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) loadMore();
        },
        { rootMargin },
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [enabled, hasMore, loadMore, rootMargin],
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
    },
    [],
  );

  return {
    visibleItems: useMemo(
      () => items.slice(0, visibleCount),
      [items, visibleCount],
    ),
    hasMore,
    loadMore,
    sentinelRef,
  };
}

// Backward-compatible spelling requested by the feature brief.
export function useInffinityScroll<T>(
  items: readonly T[],
  options?: UseInfinityScrollOptions<T>,
): UseInfinityScrollResult<T> {
  return useInfinityScroll(items, options);
}
