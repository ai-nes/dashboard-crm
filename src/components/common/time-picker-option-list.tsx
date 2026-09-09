"use client";

import { Check } from "@tailgrids/icons";
import { useRef, type RefObject, type UIEvent } from "react";
import { ListBox, ListBoxItem, type Key } from "react-aria-components";

import { cn } from "@/utils/cn";

export interface TimePickerOption {
  id: string;
  label: string;
}

interface TimePickerOptionListProps {
  label: string;
  ariaLabel: string;
  options: TimePickerOption[];
  selectedKey: string;
  listRef: RefObject<HTMLDivElement | null>;
  autoFocus?: boolean;
  loopItemCount?: number;
  onSelectionChange: (key: string) => void;
}

export function TimePickerOptionList({
  label,
  ariaLabel,
  options,
  selectedKey,
  listRef,
  autoFocus = false,
  loopItemCount,
  onSelectionChange,
}: TimePickerOptionListProps) {
  const isAdjustingScrollRef = useRef(false);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!loopItemCount || isAdjustingScrollRef.current) {
      return;
    }

    const listbox = event.currentTarget;
    const items = listbox.querySelectorAll<HTMLElement>(
      "[data-time-picker-item]",
    );
    const firstItem = items[0];
    const nextLoopFirstItem = items[loopItemCount];

    if (!firstItem || !nextLoopFirstItem) {
      return;
    }

    const loopHeight = nextLoopFirstItem.offsetTop - firstItem.offsetTop;
    const maxScrollTop = listbox.scrollHeight - listbox.clientHeight;

    if (loopHeight <= 0 || maxScrollTop <= 0) {
      return;
    }

    if (listbox.scrollTop <= 0 || listbox.scrollTop >= maxScrollTop) {
      isAdjustingScrollRef.current = true;
      listbox.scrollTop += listbox.scrollTop <= 0 ? loopHeight : -loopHeight;
      requestAnimationFrame(() => {
        isAdjustingScrollRef.current = false;
      });
    }
  };

  return (
    <div className="min-w-0">
      <p className="px-3 py-2 text-xs font-semibold text-text-100">{label}</p>
      <ListBox
        ref={listRef}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        selectionMode="single"
        selectedKeys={[selectedKey]}
        disallowEmptySelection
        onScroll={handleScroll}
        onSelectionChange={(keys) => {
          if (keys === "all") {
            return;
          }

          const nextKey = [...keys][0] as Key | undefined;
          if (nextKey !== undefined) {
            onSelectionChange(String(nextKey));
          }
        }}
        className="scrollbar-none max-h-56 overflow-y-auto px-1 py-24 outline-none"
      >
        {options.map((option) => (
          <ListBoxItem
            key={option.id}
            id={option.id}
            data-time-picker-item="true"
            textValue={option.label}
            className={cn(
              "relative flex w-full cursor-pointer rounded-md py-2 pr-8 pl-3 text-left text-sm outline-hidden",
              "data-[selected=true]:bg-dropdown-hover-background data-[selected=true]:text-title-50",
              "data-[focused=true]:bg-dropdown-hover-background data-[focused=true]:text-title-50",
            )}
          >
            {({ isSelected }) => (
              <>
                {option.label}
                {isSelected && (
                  <Check
                    aria-hidden="true"
                    className="absolute top-1/2 right-2 size-4 -translate-y-1/2"
                  />
                )}
              </>
            )}
          </ListBoxItem>
        ))}
      </ListBox>
    </div>
  );
}
