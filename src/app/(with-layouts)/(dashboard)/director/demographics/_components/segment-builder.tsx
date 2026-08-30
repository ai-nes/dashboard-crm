"use client";

import { Close, Plus, SlidersDoubleHorizontal } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type { SegmentFilter } from "./types";

interface SegmentBuilderProps {
  filters: SegmentFilter[];
  onAdd: (filter: SegmentFilter) => void;
  onApply: () => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

const filterOptions: SegmentFilter[] = [
  { id: "academic", label: "Học lực", value: "GPA từ 8,0" },
  { id: "behavior", label: "Hành vi", value: "Đã xem học phí 2 lần" },
  { id: "schoolType", label: "Loại trường", value: "Ngoài công lập" },
  { id: "channel", label: "Kênh", value: "Sự kiện trải nghiệm" },
];

export default function SegmentBuilder({ filters, onAdd, onApply, onRemove, onReset }: SegmentBuilderProps) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <section aria-labelledby="segment-builder-title" className="rounded-2xl border-2 border-primary-200 bg-card-background p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex shrink-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text"><SlidersDoubleHorizontal size={17} aria-hidden="true" /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-semibold tracking-[0.14em] text-badge-primary-text uppercase">Segment lab</p><span className="rounded-full bg-background-soft-50 px-2 py-0.5 text-[10px] text-text-tertiary">Live preview</span></div>
            <h2 id="segment-builder-title" className="mt-1 text-sm font-semibold text-text-primary">Dựng phân khúc của bạn</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">Mỗi điều kiện làm thay đổi ngay quy mô, chất lượng và cơ hội.</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 xl:border-l xl:border-card-border xl:pl-5">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <span key={filter.id} className="inline-flex max-w-full items-center gap-1 rounded-lg border border-primary-200 bg-badge-primary-background py-1.5 pr-1.5 pl-2.5 text-xs text-badge-primary-text">
                <span className="shrink-0 text-badge-primary-text/70">{filter.label}:</span>
                <span className="truncate font-semibold">{filter.value}</span>
                <button type="button" onClick={() => onRemove(filter.id)} className="flex size-5 shrink-0 items-center justify-center rounded text-badge-primary-text hover:bg-card-background/70 focus-visible:ring-2 focus-visible:ring-button-primary-focus-ring" aria-label={`Xóa điều kiện ${filter.label}: ${filter.value}`}><Close size={13} aria-hidden="true" /></button>
              </span>
            ))}
            <Button size="xs" appearance="outline" className="shrink-0" onPress={() => setIsAdding((visible) => !visible)} aria-expanded={isAdding} aria-controls="filter-options"><Plus size={15} aria-hidden="true" />Tinh chỉnh</Button>
          </div>
          {isAdding ? <div id="filter-options" className="mt-3 flex flex-wrap gap-2 rounded-xl border border-dashed border-primary-200 bg-background-soft-50 p-3" role="group" aria-label="Điều kiện có thể thêm">{filterOptions.map((filter) => <Button key={filter.id} type="button" size="xs" appearance="outline" onPress={() => { onAdd(filter); setIsAdding(false); }} isDisabled={filters.some((current) => current.id === filter.id)}><Plus size={14} aria-hidden="true" />{filter.label}<span className="text-text-tertiary">· {filter.value}</span></Button>)}</div> : null}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-card-border pt-3 xl:border-0 xl:pt-0">
          <Button size="sm" appearance="ghost" onPress={onReset} isDisabled={filters.length === 0}>Đặt lại</Button>
          <Button size="sm" onPress={onApply}>Cập nhật insight</Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-card-border pt-3 text-xs text-text-tertiary"><span><span className="mr-1.5 inline-block size-1.5 rounded-full bg-success-500" />Tín hiệu đủ mạnh để phân tích</span><span>Ngưỡng ẩn danh: <strong className="font-medium text-text-secondary">30 hồ sơ</strong></span><span>Độ đầy dữ liệu: <strong className="font-medium text-text-secondary">94,8%</strong></span></div>
    </section>
  );
}
