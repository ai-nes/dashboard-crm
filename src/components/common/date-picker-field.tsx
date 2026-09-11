"use client";

import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeader,
  CalendarMonthYearPicker,
  NavButton,
} from "@/components/tailgrids/core/calendar";
import { DateInput, DateSegment } from "@/components/tailgrids/core/date-field";
import {
  DatePicker,
  DatePickerGroup,
  DatePickerPopover,
  DatePickerTrigger,
} from "@/components/tailgrids/core/date-picker";
import { cn } from "@/utils/cn";
import { Calendar as CalendarIcon } from "@tailgrids/icons";
import { CalendarDate, parseDate } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

export function DatePickerField({
  value,
  onChange,
  ariaLabel,
  min,
  max,
  disabled = false,
  isInvalid = false,
  "aria-describedby": ariaDescribedBy,
  className,
}: DatePickerFieldProps) {
  const dateValue = parseInputDate(value);
  const minValue = parseInputDate(min);
  const maxValue = parseInputDate(max);

  return (
    <I18nProvider locale="vi-VN">
      <DatePicker<CalendarDate>
        aria-label={ariaLabel}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        className="w-full"
        disabled={disabled}
        maxValue={maxValue ?? undefined}
        minValue={minValue ?? undefined}
        onChange={(nextValue) => onChange(nextValue?.toString() ?? "")}
        value={dateValue}
      >
        <DatePickerGroup className="w-full">
          <DateInput
            aria-label={ariaLabel}
            className={cn(
              "h-9 w-full px-3 py-2 pr-10 text-sm",
              isInvalid &&
                "border-input-error-focus-border focus:ring-input-error-focus-border/20",
              className,
            )}
          >
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <DatePickerTrigger
            aria-label="Mở lịch"
            className="right-2 text-text-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <CalendarIcon size={16} aria-hidden="true" />
          </DatePickerTrigger>
        </DatePickerGroup>

        <DatePickerPopover className="z-50 w-[min(21rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-card-border bg-background-100 p-0 shadow-lg">
          <Calendar className="rounded-2xl border-0 p-3 shadow-none sm:p-4">
            <CalendarHeader className="mb-3 px-0">
              <CalendarMonthYearPicker className="min-w-0 flex-1" />
              <div className="flex shrink-0 items-center gap-0.5">
                <NavButton slot="previous" className="size-8" />
                <NavButton slot="next" className="size-8" />
              </div>
            </CalendarHeader>
            <CalendarGrid>
              <CalendarGridHeader className="pb-2 text-[11px] tracking-normal" />
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell date={date} className="size-9 sm:size-10" />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </DatePickerPopover>
      </DatePicker>
    </I18nProvider>
  );
}

function parseInputDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}
