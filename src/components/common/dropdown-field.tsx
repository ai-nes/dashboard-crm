"use client";

import { Check, ChevronDown, Search1 } from "@tailgrids/icons";
import {
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { cn } from "@/utils/cn";

export interface DropdownOption {
  id: string;
  label: string;
  description?: ReactNode;
  searchText?: string;
  isDisabled?: boolean;
}

export interface DropdownFieldProps {
  options: readonly DropdownOption[];
  value?: string | null;
  onChange: (value: string | null) => void;
  ariaLabel: string;
  placeholder?: string;
  selectedLabel?: string;
  isSearchable?: boolean;
  filterOptions?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: ReactNode;
  errorMessage?: ReactNode;
  emptyMessage?: ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  ariaDescribedBy?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
  appearance?: ButtonProps["appearance"];
  renderValue?: (option: DropdownOption | undefined) => ReactNode;
  renderOption?: (
    option: DropdownOption,
    state: { isSelected: boolean },
  ) => ReactNode;
}

const DEFAULT_PLACEHOLDER = "Chọn giá trị";

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

export function DropdownField({
  options,
  value,
  onChange,
  ariaLabel,
  placeholder = DEFAULT_PLACEHOLDER,
  selectedLabel,
  isSearchable = false,
  filterOptions = true,
  searchPlaceholder = "Tìm kiếm...",
  onSearchChange,
  isLoading = false,
  isError = false,
  loadingMessage = "Đang tải danh sách...",
  errorMessage = "Không thể tải danh sách.",
  emptyMessage = "Không tìm thấy kết quả phù hợp.",
  isDisabled = false,
  isRequired = false,
  isInvalid = false,
  ariaDescribedBy,
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
  triggerClassName,
  contentClassName,
  optionClassName,
  appearance = "outline",
  renderValue,
  renderOption,
}: DropdownFieldProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const selectedOption = options.find((option) => option.id === value);

  const visibleOptions = useMemo(() => {
    if (!isSearchable || !filterOptions) return options;

    const normalizedQuery = normalizeSearchValue(deferredQuery);
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      normalizeSearchValue(
        `${option.label} ${option.searchText ?? ""}`,
      ).includes(normalizedQuery),
    );
  }, [deferredQuery, filterOptions, isSearchable, options]);

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (controlledIsOpen === undefined) setUncontrolledIsOpen(nextIsOpen);
    if (!nextIsOpen) {
      setQuery("");
      onSearchChange?.("");
    }
    onOpenChange?.(nextIsOpen);
  };

  const handleSearchChange = (nextQuery: string) => {
    setQuery(nextQuery);
    onSearchChange?.(nextQuery);
  };

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === undefined) return;

    onChange(String(selectedKey));
    handleOpenChange(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        appearance={appearance}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid || undefined}
        aria-required={isRequired || undefined}
        className={cn(
          "h-9 w-full min-w-0 justify-between border-card-border bg-background-white-secondary px-3 py-2 text-left text-sm font-normal shadow-xs",
          isInvalid && "border-input-error-focus-border",
          className,
          triggerClassName,
        )}
        isDisabled={isDisabled}
      >
        <span className="min-w-0 truncate">
          {renderValue
            ? renderValue(selectedOption)
            : selectedOption?.label || selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-tertiary transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </Button>
      <Popover
        placement="bottom start"
        className={cn(
          "w-(--trigger-width) overflow-hidden rounded-lg border border-card-border bg-background-white-secondary shadow-md",
          "entering:animate-in entering:fade-in-0 entering:zoom-in-95",
          "exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95",
          contentClassName,
        )}
      >
        {isSearchable && (
          <div className="border-b border-card-border p-1.5">
            <InputGroup className="h-8 rounded-md">
              <InputGroupAddon className="px-2 text-text-tertiary">
                <Search1 size={14} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                aria-label={`Tìm ${ariaLabel.toLocaleLowerCase("vi-VN")}`}
                className="h-8 py-1 text-xs"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </InputGroup>
          </div>
        )}
        <ListBox
          aria-label={`Danh sách ${ariaLabel.toLocaleLowerCase("vi-VN")}`}
          className="max-h-64 overflow-auto p-1.5 outline-none"
          items={visibleOptions}
          selectedKeys={value ? new Set([value]) : new Set()}
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
        >
          {(option) => (
            <ListBoxItem
              id={option.id}
              textValue={`${option.label} ${option.searchText ?? ""}`}
              isDisabled={option.isDisabled}
              className={cn(
                "group/item relative flex w-full cursor-pointer items-center gap-3 rounded-md py-1.5 pr-8 pl-2 text-sm text-text-secondary outline-hidden select-none focus:bg-background-gray-secondary_alt focus:text-text-primary",
                "data-disabled:pointer-events-none data-disabled:text-input-disabled-text",
                optionClassName,
              )}
            >
              {({ isSelected }) => (
                <>
                  {renderOption ? (
                    renderOption(option, { isSelected })
                  ) : (
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-text-primary">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="truncate text-xs text-text-tertiary">
                          {option.description}
                        </span>
                      )}
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute right-1.5 flex size-5 items-center justify-center text-text-primary">
                      <Check size={14} aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
        {isLoading && (
          <p
            className="px-3 py-4 text-center text-sm text-text-tertiary"
            role="status"
          >
            {loadingMessage}
          </p>
        )}
        {!isLoading && isError && (
          <p
            className="px-3 py-4 text-center text-sm text-input-error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
        {!isLoading && !isError && visibleOptions.length === 0 && (
          <p
            className="px-3 py-4 text-center text-sm text-text-tertiary"
            role="status"
          >
            {emptyMessage}
          </p>
        )}
      </Popover>
    </DialogTrigger>
  );
}
