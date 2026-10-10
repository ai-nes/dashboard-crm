"use client";

import { useCallback, useRef, type UIEvent } from "react";

import { isNearScrollBottom } from "@/utils/infinite-scroll";

export interface ScrollToLoadMoreOptions {
  enabled?: boolean;
  hasMore?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  scrollOffset?: number;
  loadMore?: () => void | Promise<unknown>;
  onSearchChange?: (query: string) => void;
}

export function useScrollToLoadMore({
  enabled = true,
  hasMore = false,
  isLoading = false,
  isError = false,
  scrollOffset = 16,
  loadMore,
}: ScrollToLoadMoreOptions) {
  const pendingLoad = useRef(false);
  const loadNextPage = useCallback(async () => {
    if (!enabled || !hasMore || isLoading || pendingLoad.current || !loadMore) return;
    pendingLoad.current = true;
    try {
      await loadMore();
    } finally {
      pendingLoad.current = false;
    }
  }, [enabled, hasMore, isLoading, loadMore]);

  const onScrollToLoadMore = useCallback((event: UIEvent<HTMLElement>) => {
    if (!isError && isNearScrollBottom(event.currentTarget, scrollOffset)) {
      // Query state owns the error UI; a scroll event must not create an unhandled rejection.
      void loadNextPage().catch(() => {});
    }
  }, [isError, loadNextPage, scrollOffset]);

  return { loadMore: loadNextPage, onScrollToLoadMore };
}
