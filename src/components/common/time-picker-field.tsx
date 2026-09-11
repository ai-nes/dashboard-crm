"use client";

import { ClockThree } from "@tailgrids/icons";
import { Time } from "@internationalized/date";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button as AriaButton, Popover, type Key } from "react-aria-components";

import { DateInput, DateSegment } from "@/components/tailgrids/core/date-field";
import { TimeField } from "@/components/tailgrids/core/time-field";
import { cn } from "@/utils/cn";

import {
  TimePickerOptionList,
  type TimePickerOption,
} from "./time-picker-option-list";

interface TimePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  isInvalid?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

export function TimePickerField({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  isInvalid = false,
  "aria-describedby": ariaDescribedBy,
  className,
}: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const timeValue = parseInputTime(value);
  const currentHour = timeValue?.hour ?? 9;
  const currentMinute = timeValue?.minute ?? 0;

  const hourOptions = useMemo<TimePickerOption[]>(
    () =>
      createLoopedOptions(
        Array.from({ length: 24 }, (_, hour) => ({
          id: `hour-${hour}`,
          label: String(hour).padStart(2, "0"),
        })),
      ),
    [],
  );
  const minuteOptions = useMemo<TimePickerOption[]>(
    () =>
      createLoopedOptions(
        Array.from({ length: 60 }, (_, minute) => ({
          id: `minute-${minute}`,
          label: String(minute).padStart(2, "0"),
        })),
      ),
    [],
  );

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      [hourListRef.current, minuteListRef.current].forEach((listbox) => {
        const selectedItem = listbox?.querySelector<HTMLElement>(
          "[data-selected='true']",
        );

        if (!listbox || !selectedItem) {
          return;
        }

        const listboxRect = listbox.getBoundingClientRect();
        const selectedItemRect = selectedItem.getBoundingClientRect();
        const selectedItemOffset =
          selectedItemRect.top -
          listboxRect.top -
          (listboxRect.height - selectedItemRect.height) / 2;

        listbox.scrollTop += selectedItemOffset;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [currentHour, currentMinute, isOpen]);

  const updateTime = (hour: number, minute: number) => {
    onChange(formatTime(new Time(hour, minute)));
  };

  return (
    <div className="relative w-full">
      <TimeField<Time>
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        value={timeValue}
        onChange={(nextValue) =>
          onChange(nextValue ? formatTime(nextValue) : "")
        }
        hourCycle={24}
        granularity="minute"
        invalid={isInvalid}
        disabled={disabled}
        className="w-full"
      >
        <div className="relative w-full">
          <DateInput
            aria-label={ariaLabel}
            state={isInvalid ? "error" : "default"}
            className={cn("h-9 w-full px-3 py-2 pr-10 text-sm", className)}
          >
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <AriaButton
            ref={triggerRef}
            type="button"
            aria-label="Mở bộ chọn giờ"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            isDisabled={disabled}
            onPress={() => setIsOpen((open) => !open)}
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-text-tertiary outline-none hover:bg-background-soft-100 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50"
          >
            <ClockThree size={16} aria-hidden="true" />
          </AriaButton>
        </div>
      </TimeField>

      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement="bottom end"
        offset={8}
        className="z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-card-border bg-background-100 p-2 shadow-lg"
      >
        <div className="flex items-center justify-between px-3 pb-1 pt-2">
          <span className="text-sm font-semibold text-text-primary">
            Chọn giờ
          </span>
          <span className="text-sm font-medium tabular-nums text-text-secondary">
            {formatTime(timeValue) || "09:00"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TimePickerOptionList
            label="Giờ"
            ariaLabel="Chọn giờ"
            options={hourOptions}
            selectedKey={getLoopedOptionKey("hour", currentHour)}
            listRef={hourListRef}
            autoFocus
            loopItemCount={24}
            onSelectionChange={(key) => {
              const hour = parseOptionValue(key, "hour-");
              if (hour !== null) {
                updateTime(hour, currentMinute);
              }
            }}
          />
          <TimePickerOptionList
            label="Phút"
            ariaLabel="Chọn phút"
            options={minuteOptions}
            selectedKey={getLoopedOptionKey("minute", currentMinute)}
            listRef={minuteListRef}
            loopItemCount={60}
            onSelectionChange={(key) => {
              const minute = parseOptionValue(key, "minute-");
              if (minute !== null) {
                updateTime(currentHour, minute);
              }
            }}
          />
        </div>
      </Popover>
    </div>
  );
}

function parseInputTime(value?: string): Time | null {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }

  return new Time(hour, minute);
}

function parseOptionValue(key: Key, prefix: string): number | null {
  const value = String(key)
    .replace(prefix, "")
    .replace(/-loop-\d+$/, "");
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

const MIDDLE_LOOP_INDEX = 1;
const LOOP_COUNT = 3;

function createLoopedOptions(options: TimePickerOption[]): TimePickerOption[] {
  return Array.from({ length: LOOP_COUNT }, (_, loopIndex) =>
    options.map((option) => ({
      ...option,
      id: `${option.id}-loop-${loopIndex}`,
    })),
  ).flat();
}

function getLoopedOptionKey(prefix: string, value: number): string {
  return `${prefix}-${value}-loop-${MIDDLE_LOOP_INDEX}`;
}

function formatTime(value: Time | null): string {
  if (!value) {
    return "";
  }

  return `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
}
