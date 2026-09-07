"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search1 } from "@tailgrids/icons";
import {
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import { TASK_ACTION_OPTIONS } from "@/services/api/tasks/action-catalog";

interface TaskActionSelectProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  hideLabel?: boolean;
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

export function TaskActionSelect({
  value,
  onChange,
  isDisabled = false,
  hideLabel = false,
}: TaskActionSelectProps) {
  const selectedAction = TASK_ACTION_OPTIONS.find(
    (option) => option.code === value,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return TASK_ACTION_OPTIONS;

    return TASK_ACTION_OPTIONS.filter((option) =>
      normalizeSearchValue(
        `${option.displayName} ${option.code} ${option.categoryLabel} ${option.description}`,
      ).includes(normalizedQuery),
    );
  }, [query]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery("");
  };

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") return;

    const selectedKey = Array.from(keys)[0];
    if (selectedKey === undefined) return;

    onChange(String(selectedKey));
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {!hideLabel && <Label>Loại task *</Label>}
      <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Button
          appearance="outline"
          aria-label="Chọn loại task"
          className="h-9 w-full justify-between border-card-border bg-card-background pr-2.5 pl-3 text-left text-sm font-medium shadow-xs"
          isDisabled={isDisabled}
          type="button"
        >
          <span className="truncate">
            {selectedAction?.displayName || "Chọn loại task"}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-text-100 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </Button>
        <Popover
          placement="bottom start"
          className="w-(--trigger-width) min-w-[320px] sm:min-w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-card-border bg-background-white-secondary shadow-lg"
        >
          <div className="border-b border-card-border p-2">
            <InputGroup className="h-9">
              <InputGroupAddon className="px-2.5 text-text-tertiary">
                <Search1 size={16} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                aria-label="Tìm loại task"
                placeholder="Tìm theo tên hoặc mã..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
          </div>
          <ListBox
            aria-label="Danh sách loại task"
            items={filteredOptions}
            selectedKeys={value ? new Set([value]) : new Set()}
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
            className="max-h-72 overflow-y-auto p-1.5 outline-none"
          >
            {(option) => (
              <ListBoxItem
                id={option.code}
                textValue={`${option.displayName} ${option.code} ${option.categoryLabel} ${option.description}`}
                className="group/item relative flex w-full cursor-pointer items-center rounded-md py-2 pr-8 pl-2 text-sm text-text-secondary outline-hidden select-none focus:bg-background-gray-secondary_alt focus:text-text-primary"
              >
                {({ isSelected }) => (
                  <>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-text-primary">
                        {option.displayName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-text-tertiary">
                        {option.categoryLabel} · {option.code}
                      </span>
                    </span>
                    {isSelected && (
                      <span className="absolute right-1 flex size-5 items-center justify-center text-primary-500">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
          {filteredOptions.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-text-tertiary">
              Không tìm thấy loại task phù hợp.
            </p>
          )}
        </Popover>
      </DialogTrigger>
    </div>
  );
}
