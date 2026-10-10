"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useScrollToLoadMore } from "./use-scroll-to-load-more";
import { normalizePageSize } from "@/utils/infinite-scroll";

export interface UseInfinityScrollOptions<T> {
  pageSize?: number;
  enabled?: boolean;
  rootMargin?: string;
  getItemKey?: (item: T, index: number) => string | number;
  scrollOffset?: number;
  resetKey?: string;
  minimumVisibleCount?: number;
}

export interface UseInfinityScrollResult<T> {
  visibleItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  sentinelRef: (node: HTMLElement | null) => void;
  onScrollToLoadMore: (event: React.UIEvent<HTMLElement>) => void;
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
    scrollOffset,
    resetKey = "",
    minimumVisibleCount = 0,
  }: UseInfinityScrollOptions<T> = {},
): UseInfinityScrollResult<T> {
  const safePageSize = normalizePageSize(pageSize);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemsKey = useMemo(
    () =>
      items
        .map((item, index) => String(getItemKey?.(item, index) ?? index))
        .join("\u0000") + `\u0001${resetKey}`,
    [getItemKey, items, resetKey],
  );
  const firstPageSize = Math.min(safePageSize, items.length);
  const minimumCount = Number.isFinite(minimumVisibleCount) ? Math.max(0, Math.trunc(minimumVisibleCount)) : 0;
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    itemsKey,
    visibleCount: firstPageSize,
  }));
  const visibleCount = Math.min(items.length, Math.max(
    pagination.itemsKey === itemsKey ? pagination.visibleCount : firstPageSize,
    minimumCount,
  ));

  const hasMore = visibleCount < items.length;
  const loadMore = useCallback(() => {
    setPagination((current) => {
      const currentCount = Math.max(
        current.itemsKey === itemsKey ? current.visibleCount : firstPageSize,
        minimumCount,
      );
      const nextCount = Math.min(currentCount + safePageSize, items.length);
      if (current.itemsKey === itemsKey && current.visibleCount === nextCount) {
        return current;
      }
      return { itemsKey, visibleCount: nextCount };
    });
  }, [firstPageSize, items.length, itemsKey, safePageSize, minimumCount]);

  const { onScrollToLoadMore } = useScrollToLoadMore({
    enabled, hasMore, loadMore, scrollOffset,
  });

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
    onScrollToLoadMore,
  };
}

// Backward-compatible spelling requested by the feature brief.
export function useInffinityScroll<T>(
  items: readonly T[],
  options?: UseInfinityScrollOptions<T>,
): UseInfinityScrollResult<T> {
  return useInfinityScroll(items, options);
}
