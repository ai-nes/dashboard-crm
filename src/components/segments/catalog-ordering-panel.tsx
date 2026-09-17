"use client";

import { ChevronDown, ChevronUp } from "@tailgrids/icons";
import { useState, type DragEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";

export interface CatalogOrderItem {
  id: string;
  code?: string | null;
  label: string;
  description?: string | null;
}

export function moveCatalogOrderItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function CatalogOrderingPanel({
  items,
  title,
  isSaving,
  onCancel,
  onSave,
}: {
  items: readonly CatalogOrderItem[];
  title: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (items: readonly CatalogOrderItem[]) => Promise<void>;
}) {
  const [orderedItems, setOrderedItems] = useState<CatalogOrderItem[]>(() => [
    ...items,
  ]);
  const [isDirty, setIsDirty] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveItem = (fromIndex: number, toIndex: number) => {
    setOrderedItems((current) =>
      moveCatalogOrderItem(current, fromIndex, toIndex),
    );
    setIsDirty(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedIndex !== null) moveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return (
    <section className="mx-4 my-4 overflow-hidden rounded-xl border border-card-border bg-background-white-secondary sm:mx-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-card-border px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Sắp xếp {title}</h3>
          <p className="mt-1 text-sm text-text-tertiary">
            Kéo thả hoặc dùng nút lên/xuống. Thứ tự chỉ được cập nhật sau khi lưu.
          </p>
        </div>
        <span className="rounded-full bg-background-gray-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
          {orderedItems.length} mục
        </span>
      </div>
      {orderedItems.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-text-tertiary sm:px-5">
          Chưa có dữ liệu để sắp xếp.
        </p>
      ) : (
        <div className="divide-y divide-card-border" role="list" aria-label={`Thứ tự ${title}`}>
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              role="listitem"
              draggable={!isSaving}
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`flex items-center gap-3 px-4 py-3 transition-colors sm:px-5 ${
                draggedIndex === index
                  ? "bg-tab-active-background opacity-70"
                  : "hover:bg-background-gray-secondary/40"
              }`}
            >
              <span
                className="cursor-grab select-none text-lg leading-none text-text-tertiary active:cursor-grabbing"
                title="Kéo để sắp xếp"
                aria-hidden="true"
              >
                ⋮⋮
              </span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background-gray-secondary text-xs font-semibold text-text-secondary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{item.label}</p>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  {[item.code, item.description].filter(Boolean).join(" · ") || "Không có mô tả"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  aria-label={`Đưa ${item.label} lên trên`}
                  iconOnly
                  size="sm"
                  appearance="ghost"
                  isDisabled={isSaving || index === 0}
                  onPress={() => moveItem(index, index - 1)}
                >
                  <ChevronUp size={16} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  aria-label={`Đưa ${item.label} xuống dưới`}
                  iconOnly
                  size="sm"
                  appearance="ghost"
                  isDisabled={isSaving || index === orderedItems.length - 1}
                  onPress={() => moveItem(index, index + 1)}
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3 sm:px-5">
        <Button type="button" size="sm" appearance="outline" isDisabled={isSaving} onPress={onCancel}>
          Hủy
        </Button>
        <Button
          type="button"
          size="sm"
          isDisabled={isSaving || !isDirty}
          onPress={() => void onSave(orderedItems)}
        >
          {isSaving ? "Đang lưu…" : "Lưu thứ tự"}
        </Button>
      </div>
    </section>
  );
}
