"use client";

import type { Ref } from "react";
import {
  ListBox,
  ListLayout,
  Virtualizer,
  type ListBoxProps,
} from "react-aria-components";

import { useScrollToLoadMore, type ScrollToLoadMoreOptions } from "@/hooks/use-scroll-to-load-more";
import { ScrollArea, ScrollAreaViewport, ScrollBar } from "@/components/tailgrids/core/scroll-area";
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
  style,
  pagination,
  onScroll,
  ...props
}: InfiniteListBoxProps<T>) {
  const { onScrollToLoadMore } = useScrollToLoadMore(pagination ?? {});

  return (
    <>
      <ScrollArea className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Virtualizer layout={ListLayout} layoutOptions={layoutOptions}>
          <ScrollAreaViewport
            ref={ref}
            render={(viewportProps) => (
              <ListBox
                {...viewportProps}
                {...props}
                className={(state) => cn(
                  viewportProps.className,
                  "min-h-0 min-w-0 max-h-64",
                  typeof className === "function" ? className(state) : className,
                  // Virtualizer sizes presentation wrappers to clientWidth, which includes list padding.
                  "overflow-x-hidden overflow-y-auto [&_[role=presentation]]:max-w-full",
                )}
                style={(state) => ({
                  ...viewportProps.style,
                  ...(typeof style === "function" ? style(state) : style),
                  overflowX: "hidden",
                  overflowY: "auto",
                })}
                onScroll={(event) => {
                  viewportProps.onScroll?.(event);
                  onScroll?.(event);
                  onScrollToLoadMore(event);
                }}
              />
            )}
          />
        </Virtualizer>
        <ScrollBar />
      </ScrollArea>
      <DropdownPaginationStatus pagination={pagination} />
    </>
  );
}
