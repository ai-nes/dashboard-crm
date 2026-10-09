"use client";

import type { Ref } from "react";
import {
  ListBox,
  ListLayout,
  Virtualizer,
  type ListBoxProps,
} from "react-aria-components";

import { useScrollToLoadMore, type ScrollToLoadMoreOptions } from "@/hooks/use-scroll-to-load-more";
import { cn } from "@/utils/cn";
import { DropdownPaginationStatus } from "./dropdown-pagination-status";

export interface InfiniteListBoxProps<T> extends ListBoxProps<T> {
  ref?: Ref<HTMLDivElement>;
  pagination?: ScrollToLoadMoreOptions;
}

const layoutOptions = { estimatedRowHeight: 32, estimatedHeadingHeight: 28 };

export function InfiniteListBox<T>({
  ref,
  className,
  pagination,
  onScroll,
  ...props
}: InfiniteListBoxProps<T>) {
  const { onScrollToLoadMore } = useScrollToLoadMore(pagination ?? {});

  return (
    <>
      <Virtualizer layout={ListLayout} layoutOptions={layoutOptions}>
        <ListBox
          {...props}
          ref={ref}
          className={typeof className === "function"
            ? (state) => cn("min-h-0 max-h-64 overflow-auto", className(state))
            : cn("min-h-0 max-h-64 overflow-auto", className)}
          onScroll={(event) => {
            onScroll?.(event);
            onScrollToLoadMore(event);
          }}
        />
      </Virtualizer>
      <DropdownPaginationStatus pagination={pagination} />
    </>
  );
}
