"use client";

import { ChevronDown, Search1 } from "@tailgrids/icons";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  Header as ListBoxHeader,
  ListBox,
  ListBoxSection,
  type Key,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Popover } from "@/components/tailgrids/core/popover";
import { SelectItem } from "@/components/tailgrids/core/select";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { cn } from "@/utils/cn";

const EMPTY_OPTION_ID = "__empty_major__";

export interface MajorSelectorOption {
  id: string;
  label: string;
  groupName?: string | null;
  groupLabel?: string | null;
  description?: ReactNode;
  searchText?: string;
  isDisabled?: boolean;
}

export interface MajorSelectorProps {
  options: readonly MajorSelectorOption[];
  value?: string | null;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  searchPlaceholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: ReactNode;
  allowClear?: boolean;
  className?: string;
  contentClassName?: string;
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

export function toMajorSelectorOptions(
  options?: readonly {
    value: string;
    label: string;
    groupName?: string | null;
    groupLabel?: string | null;
  }[],
): MajorSelectorOption[] {
  return (
    options?.map((option) => ({
      id: option.value,
      label: option.label,
      groupName: option.groupName,
      groupLabel: option.groupLabel,
    })) ?? []
  );
}

function getGroupLabel(option: MajorSelectorOption): string {
  return (
    option.groupLabel?.trim() || option.groupName?.trim() || "Chưa phân nhóm"
  );
}

function groupOptions(options: readonly MajorSelectorOption[]) {
  const groups = new Map<string, MajorSelectorOption[]>();
  for (const option of options) {
    const label = getGroupLabel(option);
    const current = groups.get(label) ?? [];
    current.push(option);
    groups.set(label, current);
  }
  return Array.from(groups, ([label, groupOptions]) => ({
    label,
    options: groupOptions,
  }));
}

export function MajorSelector({
  options,
  value,
  onChange,
  ariaLabel,
  placeholder = "Chọn ngành quan tâm",
  searchPlaceholder = "Tìm ngành hoặc nhóm ngành...",
  isDisabled = false,
  isLoading = false,
  isError = false,
  errorMessage = "Không thể tải danh sách ngành.",
  allowClear = false,
  className,
  contentClassName,
}: MajorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const selectedOption = options.find((option) => option.id === value);
  const selectedFallback =
    value && !selectedOption
      ? { id: value, label: value, groupLabel: "Chưa phân nhóm" }
      : selectedOption;

  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(deferredQuery);
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      normalizeSearchValue(
        `${option.label} ${getGroupLabel(option)} ${option.searchText ?? ""}`,
      ).includes(normalizedQuery),
    );
  }, [deferredQuery, options]);
  const visibleGroups = useMemo(
    () => groupOptions(visibleOptions),
    [visibleOptions],
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuery("");
    }
  };

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === undefined) return;
    onChange(
      String(selectedKey) === EMPTY_OPTION_ID ? "" : String(selectedKey),
    );
    handleOpenChange(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        appearance="outline"
        aria-label={ariaLabel}
        className={cn(
          "h-10 w-full min-w-0 justify-between border-card-border bg-background-white-secondary px-2.5 py-2 text-left text-sm font-normal shadow-xs",
          className,
        )}
        isDisabled={isDisabled}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selectedFallback ? (
            <span className="min-w-0 truncate text-text-primary">
              {selectedFallback.label}
            </span>
          ) : (
            <span className="truncate text-text-tertiary">{placeholder}</span>
          )}
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
          "w-(--trigger-width) overflow-hidden rounded-lg border border-card-border bg-background-white-secondary p-0 shadow-md",
          contentClassName,
        )}
      >
        <Dialog aria-label={ariaLabel} className="p-2 outline-none">
          <InputGroup className="h-8">
            <InputGroupAddon className="px-2 text-text-tertiary">
              <Search1 size={14} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              aria-label={searchPlaceholder}
              className="h-8 py-1 text-xs"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          {isLoading ? (
            <div
              className="space-y-2 p-2"
              role="status"
              aria-label="Đang tải ngành"
            >
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isError ? (
            <p
              className="px-2 py-4 text-center text-xs text-input-error"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : (
            <ListBox
              aria-label={`Danh sách ${ariaLabel.toLocaleLowerCase("vi-VN")}`}
              className="mt-1 max-h-64 overflow-auto p-1 outline-none"
              selectedKeys={value ? new Set([value]) : new Set()}
              selectionMode="single"
              onSelectionChange={handleSelectionChange}
            >
              {allowClear && value && (
                <SelectItem
                  id={EMPTY_OPTION_ID}
                  textValue="Bỏ chọn ngành"
                  className="text-text-tertiary"
                >
                  Bỏ chọn ngành
                </SelectItem>
              )}
              {visibleGroups.length > 0 ? (
                visibleGroups.map((group) => (
                  <ListBoxSection key={group.label} aria-label={group.label}>
                    <ListBoxHeader className="px-1.5 py-1 text-xs font-bold text-text-primary">
                      {group.label}
                    </ListBoxHeader>
                    {group.options.map((option) => (
                      <SelectItem
                        key={option.id}
                        id={option.id}
                        textValue={`${option.label} ${getGroupLabel(option)}`}
                        isDisabled={option.isDisabled}
                        className="pl-4"
                      >
                        {({ isSelected }) => (
                          <span className="flex min-w-0 items-center gap-2 py-0.5">
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate",
                                isSelected && "font-medium text-text-primary",
                              )}
                            >
                              {option.label}
                            </span>
                            {option.description && (
                              <span className="max-w-[45%] truncate text-xs text-text-tertiary">
                                {option.description}
                              </span>
                            )}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </ListBoxSection>
                ))
              ) : (
                <SelectItem
                  id="no-major-results"
                  isDisabled
                  textValue="Không tìm thấy ngành"
                >
                  Không tìm thấy ngành phù hợp
                </SelectItem>
              )}
            </ListBox>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
