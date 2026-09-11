"use client";

import { buttonStyles } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "@tailgrids/icons";
import { cva } from "class-variance-authority";
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  Heading as AriaHeading,
  CalendarCellRenderProps,
  CalendarHeaderCell,
  CalendarStateContext,
  ListBox,
  ListBoxItem,
  Popover,
  useLocale,
  type CalendarCellProps as AriaCalendarCellProps,
  type CalendarProps as AriaCalendarProps,
  type DateValue,
} from "react-aria-components";

const calendarStyles = cva(
  "flex w-full flex-col rounded-3xl border border-base-100 bg-background-50 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-5",
);

export interface CalendarProps<T extends DateValue> extends Omit<
  AriaCalendarProps<T>,
  "visibleDuration" | "isDisabled" | "isReadOnly"
> {
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
}

export function Calendar<T extends DateValue>({
  className,
  children,
  disabled,
  readonly,
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar
      {...props}
      className={cn(calendarStyles(), className)}
      isDisabled={disabled}
      isReadOnly={readonly}
    >
      {children}
    </AriaCalendar>
  );
}

const calendarHeaderStyles = cva("mb-4 flex items-center gap-2 px-1");

type CalendarHeaderProps = ComponentProps<"header">;

export function CalendarHeader({ className, ...props }: CalendarHeaderProps) {
  return (
    <header className={cn(calendarHeaderStyles(), className)} {...props}>
      {props.children}
    </header>
  );
}

type NavButtonProps = ComponentProps<typeof AriaButton> & {
  slot: "previous" | "next";
};

export function NavButton({ slot, className, ...props }: NavButtonProps) {
  const { direction } = useLocale();

  return (
    <AriaButton
      slot={slot}
      type="button"
      className={cn(
        buttonStyles({
          variant: "ghost",
          iconOnly: true,
          size: "sm",
        }),
        "size-9 shrink-0 rounded-full text-text-50",
        className,
      )}
      aria-label={slot === "previous" ? "Previous month" : "Next month"}
      {...props}
    >
      {slot === "previous" ? (
        direction === "rtl" ? (
          <ChevronRight aria-hidden />
        ) : (
          <ChevronLeft aria-hidden />
        )
      ) : direction === "rtl" ? (
        <ChevronLeft aria-hidden />
      ) : (
        <ChevronRight aria-hidden />
      )}
    </AriaButton>
  );
}

type CalendarPickerProps = {
  className?: string;
};

export function CalendarMonthYearPicker({ className }: CalendarPickerProps) {
  const state = useContext(CalendarStateContext);
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const monthListboxRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const currentMonth = state?.focusedDate.month ?? new Date().getMonth() + 1;
  const currentYear = state?.focusedDate.year ?? new Date().getFullYear();
  const months = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: "long" });

    return Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,
      label: formatter.format(new Date(Date.UTC(2000, index, 1))),
    }));
  }, [locale]);

  const years = useMemo(
    () => Array.from({ length: 201 }, (_, index) => 1900 + index),
    [],
  );

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      [monthListboxRef.current, listboxRef.current].forEach(
        (listboxElement) => {
          const selectedItem = listboxElement?.querySelector<HTMLElement>(
            "[data-selected='true']",
          );

          if (!listboxElement || !selectedItem) {
            return;
          }

          const listboxRect = listboxElement.getBoundingClientRect();
          const selectedItemRect = selectedItem.getBoundingClientRect();
          const selectedItemOffset =
            selectedItemRect.top -
            listboxRect.top -
            (listboxRect.height - selectedItemRect.height) / 2;

          listboxElement.scrollTop += selectedItemOffset;
        },
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, currentMonth, currentYear]);

  if (!state) {
    return;
  }

  const focusedDate = state.focusedDate;
  const currentDay = focusedDate.day;
  const currentMonthLabel = months[currentMonth - 1]?.label ?? "";
  const currentMonthTitle = `${currentMonthLabel.charAt(0).toUpperCase()}${currentMonthLabel.slice(1)}`;
  const setFocusedMonth = (month: number) => {
    const safeDate = focusedDate.set({ day: 1, month });
    const maxDay = safeDate.calendar.getDaysInMonth(safeDate);
    state.setFocusedDate(safeDate.set({ day: Math.min(currentDay, maxDay) }));
  };
  const setFocusedYear = (year: number) => {
    const safeDate = focusedDate.set({ day: 1, year });
    const maxDay = safeDate.calendar.getDaysInMonth(safeDate);
    state.setFocusedDate(safeDate.set({ day: Math.min(currentDay, maxDay) }));
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Chọn tháng và năm"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-11 min-w-0 items-center justify-start gap-2 rounded-md p-0 text-left text-base font-medium text-title-50 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary-focus-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        <span className="truncate">
          {currentMonthTitle} năm {currentYear}
        </span>
        <ChevronDown aria-hidden className="size-5 shrink-0 text-text-50" />
      </button>

      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement="bottom"
        offset={8}
        className="w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-dropdown-background p-2 shadow-lg"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="px-3 py-2 text-xs font-semibold text-text-100">
              Tháng
            </p>
            <ListBox
              ref={monthListboxRef}
              aria-label="Chọn tháng"
              autoFocus
              selectionMode="single"
              selectedKeys={[`month-${currentMonth}`]}
              disallowEmptySelection
              onSelectionChange={(keys) => {
                if (keys === "all") {
                  return;
                }

                const selectedMonth = Number(
                  String([...keys][0]).replace("month-", ""),
                );
                if (!Number.isNaN(selectedMonth)) {
                  setFocusedMonth(selectedMonth);
                }
              }}
              className="scrollbar-none max-h-64 overflow-y-auto p-1 outline-none"
            >
              {months.map((month) => (
                <ListBoxItem
                  key={`month-${month.value}`}
                  id={`month-${month.value}`}
                  textValue={month.label}
                  className={cn(
                    "relative flex w-full cursor-pointer rounded-md py-2 pr-8 pl-3 text-left text-sm capitalize outline-hidden",
                    "data-[selected=true]:bg-dropdown-hover-background data-[selected=true]:text-title-50",
                    "data-[focused=true]:bg-dropdown-hover-background data-[focused=true]:text-title-50",
                  )}
                >
                  {({ isSelected }) => (
                    <>
                      {month.label}
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

          <div className="min-w-0">
            <p className="px-3 py-2 text-xs font-semibold text-text-100">Năm</p>
            <ListBox
              ref={listboxRef}
              aria-label="Chọn năm"
              selectionMode="single"
              selectedKeys={[`year-${currentYear}`]}
              disallowEmptySelection
              shouldFocusWrap
              onSelectionChange={(keys) => {
                if (keys === "all") {
                  return;
                }

                const selectedYear = Number(
                  String([...keys][0]).replace("year-", ""),
                );
                if (!Number.isNaN(selectedYear)) {
                  setFocusedYear(selectedYear);
                }
              }}
              className="scrollbar-none max-h-64 overflow-y-auto p-1 outline-none"
            >
              {years.map((year) => (
                <ListBoxItem
                  key={`year-${year}`}
                  id={`year-${year}`}
                  textValue={String(year)}
                  className={cn(
                    "relative flex w-full cursor-pointer rounded-md py-2 pr-8 pl-3 text-left text-sm outline-hidden",
                    "data-[selected=true]:bg-dropdown-hover-background data-[selected=true]:text-title-50",
                    "data-[focused=true]:bg-dropdown-hover-background data-[focused=true]:text-title-50",
                  )}
                >
                  {({ isSelected }) => (
                    <>
                      {year}
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
        </div>
      </Popover>
    </>
  );
}

const calendarGridStyles = cva("w-full border-collapse border-spacing-0");

type CalendarGridProps = ComponentProps<typeof AriaCalendarGrid>;

export function CalendarGrid({ className, ...props }: CalendarGridProps) {
  return (
    <AriaCalendarGrid
      className={cn(calendarGridStyles(), className)}
      {...props}
    />
  );
}

type CalendarGridBodyProps = ComponentProps<typeof AriaCalendarGridBody>;

export function CalendarGridBody({ ...props }: CalendarGridBodyProps) {
  return <AriaCalendarGridBody {...props} />;
}

type CalendarHeadingProps = ComponentProps<typeof AriaHeading>;

export function CalendarHeading({ className, ...props }: CalendarHeadingProps) {
  return (
    <AriaHeading {...props} className={cn("flex-1 text-center", className)} />
  );
}

export type { DateValue };

const calendarGridHeaderCellStyles = cva(
  "table-grid-header-cell pb-2 text-center text-[0.7rem] font-medium tracking-[0.16em] text-text-100 uppercase sm:text-xs",
);

export function CalendarGridHeader({ className }: { className?: string }) {
  return (
    <AriaCalendarGridHeader>
      {(day: string) => (
        <CalendarHeaderCell
          className={cn(calendarGridHeaderCellStyles(), className)}
        >
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  );
}

const calendarCellButtonStyles = cva(
  "flex size-10 items-center justify-center rounded-full text-sm font-medium text-title-50 transition forced-color-adjust-none outline-none [-webkit-tap-highlight-color:transparent] group-data-[today=true]:bg-datepicker-selected-background/90 group-data-[today=true]:text-white group-[[data-unavailable=true]:not([data-today=true])]:text-text-100 group-[&[data-disabled=true]:not([data-outside-month]):not([data-today])]:text-text-100 hover:bg-datepicker-selected-hover-background group-data-[today=true]:hover:bg-datepicker-selected-background/90 data-[disabled=true]:cursor-not-allowed data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-button-primary-focus-ring data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-offset-background-50 data-[outside-month=true]:pointer-events-none data-[outside-month=true]:text-text-200 data-[pressed=true]:scale-95 data-[selected=true]:bg-datepicker-selected-background data-[selected=true]:text-white-100 sm:size-11 [&[data-disabled=true]:not([data-outside-month])]:line-through",
);

interface CalendarCellProps extends Omit<
  AriaCalendarCellProps,
  | "isDisabled"
  | "isFocusVisible"
  | "isOutsideMonth"
  | "isPressed"
  | "isSelected"
> {
  className?: string;
  disabled?: boolean;
  focusVisible?: boolean;
  outsideMonth?: boolean;
  pressed?: boolean;
  selected?: boolean;
}

export function CalendarCell({
  className,
  disabled,
  focusVisible,
  outsideMonth,
  pressed,
  selected,
  ...props
}: CalendarCellProps) {
  return (
    <AriaCalendarCell {...props} className="group p-0 outline-none">
      {({
        formattedDate,
        isDisabled,
        isFocusVisible,
        isOutsideMonth,
        isPressed,
        isSelected,
      }: CalendarCellRenderProps) => (
        <span
          data-disabled={(disabled ?? isDisabled) || undefined}
          data-focus-visible={(focusVisible ?? isFocusVisible) || undefined}
          data-outside-month={(outsideMonth ?? isOutsideMonth) || undefined}
          data-pressed={(pressed ?? isPressed) || undefined}
          data-selected={(selected ?? isSelected) || undefined}
          className={cn(calendarCellButtonStyles(), className)}
        >
          {formattedDate}
        </span>
      )}
    </AriaCalendarCell>
  );
}
