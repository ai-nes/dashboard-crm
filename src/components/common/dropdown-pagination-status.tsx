"use client";

import type { ScrollToLoadMoreOptions } from "@/hooks/use-scroll-to-load-more";
import { Button } from "@/components/tailgrids/core/button";

export function DropdownPaginationStatus({ pagination }: { pagination?: ScrollToLoadMoreOptions }) {
  if (!pagination?.hasMore) return null;
  if (pagination.isError) {
    return (
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2" role="alert">
        <span className="text-xs text-input-error">Chưa thể tải thêm lựa chọn.</span>
        <Button
          type="button"
          appearance="ghost"
          size="xs"
          onPress={() => { void Promise.resolve(pagination.loadMore?.()).catch(() => {}); }}
        >
          Thử lại
        </Button>
      </div>
    );
  }
  return pagination.isLoading ? (
    <p className="shrink-0 px-3 py-2 text-center text-xs text-text-tertiary" role="status">
      Đang tải thêm lựa chọn…
    </p>
  ) : null;
}
