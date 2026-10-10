"use client";

import { useMemo } from "react";
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";

import { normalizePageSize } from "@/utils/infinite-scroll";
import { getNextLimit } from "@/utils/limit-pagination";
import { useScrollToLoadMore } from "./use-scroll-to-load-more";

interface LimitInfinityScrollOptions<TResponse, TItem> {
  queryKey: QueryKey;
  fetchPage: (params: { limit: number }, signal: AbortSignal) => Promise<TResponse>;
  getItems: (response: TResponse) => readonly TItem[];
  enabled?: boolean;
  pageSize?: number;
  initialLimit?: number;
  maxLimit?: number;
  staleTime?: number;
}

/** The API returns a growing prefix (limit), not disjoint offset pages. */
export function useLimitInfinityScroll<TResponse, TItem>({
  queryKey,
  fetchPage,
  getItems,
  enabled = true,
  pageSize = 20,
  initialLimit = pageSize,
  maxLimit = 500,
  staleTime = 5 * 60 * 1000,
}: LimitInfinityScrollOptions<TResponse, TItem>) {
  const step = normalizePageSize(pageSize);
  const cap = normalizePageSize(maxLimit);
  const firstLimit = Math.min(cap, normalizePageSize(initialLimit));
  const query = useInfiniteQuery({
    queryKey: [...queryKey, "infinite-limit", firstLimit, step, cap],
    initialPageParam: firstLimit,
    queryFn: async ({ pageParam, signal }) => ({
      response: await fetchPage({ limit: pageParam }, signal),
      limit: pageParam,
    }),
    getNextPageParam: (lastPage) => getNextLimit(getItems(lastPage.response).length, lastPage.limit, step, cap),
    enabled,
    staleTime,
    retry: false,
  });
  const response = query.data?.pages.at(-1)?.response;
  const items = useMemo(() => response ? getItems(response) : [], [getItems, response]);
  const scroll = useScrollToLoadMore({
    enabled,
    hasMore: query.hasNextPage,
    isLoading: query.isFetching,
    isError: query.isFetchNextPageError,
    loadMore: () => query.fetchNextPage({ cancelRefetch: false }),
  });

  return {
    ...query,
    data: response,
    items,
    loadMore: scroll.loadMore,
    onScrollToLoadMore: scroll.onScrollToLoadMore,
    pagination: {
      enabled,
      hasMore: query.hasNextPage,
      isLoading: query.isFetching,
      isError: query.isFetchNextPageError,
      loadMore: scroll.loadMore,
    },
  };
}
