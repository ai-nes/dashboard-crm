"use client";

import { Close, Plus } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import type { SegmentFilter } from "./types";

interface SegmentBuilderProps {
  filters: SegmentFilter[];
  onAdd: () => void;
  onApply: () => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

export default function SegmentBuilder({ filters, onAdd, onApply, onRemove, onReset }: SegmentBuilderProps) {
  return (
    <section aria-labelledby="segment-builder-title" className="rounded-xl border border-card-border bg-card-background p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="shrink-0">
          <h2 id="segment-builder-title" className="text-sm font-semibold text-text-primary">Xây dựng phân khúc</h2>
          <p className="mt-0.5 text-xs text-text-tertiary">Kết hợp các điều kiện để xem quy mô và chuyển đổi.</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2 xl:border-l xl:border-card-border xl:pl-4">
          {filters.map((filter) => (
            <span key={filter.id} className="inline-flex max-w-full items-center gap-1 rounded-md border border-card-border bg-background-soft-50 py-1.5 pr-1.5 pl-2.5 text-xs text-text-secondary">
              <span className="shrink-0 text-text-tertiary">{filter.label}:</span>
              <span className="truncate font-medium text-text-primary">{filter.value}</span>
              <button type="button" onClick={() => onRemove(filter.id)} className="flex size-5 shrink-0 items-center justify-center rounded text-text-tertiary hover:bg-background-soft-200 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-button-primary-focus-ring" aria-label={`Xóa điều kiện ${filter.label}: ${filter.value}`}><Close size={13} /></button>
            </span>
          ))}
          <Button size="xs" appearance="outline" className="shrink-0" onPress={onAdd} aria-label="Thêm điều kiện lọc"><Plus size={15} />Thêm điều kiện</Button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" appearance="ghost" onPress={onReset} isDisabled={filters.length === 0}>Đặt lại</Button>
          <Button size="sm" onPress={onApply}>Áp dụng</Button>
        </div>
      </div>
    </section>
  );
}
