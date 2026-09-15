"use client";

import { Pin } from "@tailgrids/icons";
import { DialogTrigger, Popover as AriaPopover } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";

export interface StickyColumnOption {
  id: string;
  label: string;
}

interface StickyColumnPickerProps {
  options: StickyColumnOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function StickyColumnPicker({
  options,
  selected,
  onChange,
}: StickyColumnPickerProps) {
  if (options.length === 0) return null;

  const selectedSet = new Set(selected);
  const selectedCount = options.filter((option) => selectedSet.has(option.id)).length;

  return (
    <DialogTrigger>
      <Button
        type="button"
        size="sm"
        appearance="outline"
        className="gap-1.5"
        aria-label="Chọn cột ghim"
      >
        <Pin size={15} aria-hidden="true" />
        Ghim cột{selectedCount > 0 ? ` (${selectedCount})` : ""}
      </Button>
      <AriaPopover
        placement="bottom end"
        className="z-50 w-64 rounded-lg border border-card-border bg-background-white-secondary p-2 shadow-lg outline-none"
      >
        <p className="px-2 py-1 text-xs font-semibold text-text-secondary">
          Chọn cột luôn hiển thị khi kéo ngang
        </p>
        <div className="mt-1 space-y-0.5">
          {options.map((option) => (
            <Checkbox
              key={option.id}
              size="sm"
              isSelected={selectedSet.has(option.id)}
              onChange={(isSelected) => {
                const next = new Set(selected);
                if (isSelected) next.add(option.id);
                else next.delete(option.id);
                onChange(options.map((item) => item.id).filter((id) => next.has(id)));
              }}
              className="w-full rounded-md px-2 py-2 text-left text-sm text-text-primary hover:bg-background-gray-secondary_alt"
            >
              {option.label}
            </Checkbox>
          ))}
        </div>
      </AriaPopover>
    </DialogTrigger>
  );
}

export function stickyColumnClass(isSticky: boolean): string | undefined {
  return isSticky
    ? "sticky z-10 bg-background-white-secondary shadow-[4px_0_8px_-8px_rgba(0,0,0,0.45)]"
    : undefined;
}

export function stickyColumnStyle(
  stickyIndex: number,
  width: number,
  baseLeft = 56,
): { left: number } | undefined {
  return stickyIndex >= 0 ? { left: baseLeft + stickyIndex * width } : undefined;
}

export function reorderStickyColumns<T extends { id: string }>(
  columns: T[],
  selected: string[],
): T[] {
  const selectedSet = new Set(selected);
  return [...columns].sort(
    (left, right) =>
      Number(!selectedSet.has(left.id)) - Number(!selectedSet.has(right.id)),
  );
}
