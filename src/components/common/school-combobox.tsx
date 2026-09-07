"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { Check, ChevronDown, Search1 } from "@tailgrids/icons";
import {
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";

import { useSchoolDirectoryQuery } from "@/hooks/use-school-directory-query";
import type { SchoolDirectoryRecord } from "@/services/api/schools/types";
import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { cn } from "@/utils/cn";

interface SchoolComboboxProps {
  value: string;
  province?: string;
  ward?: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  isDisabled?: boolean;
  className?: string;
}

export function SchoolCombobox({
  value,
  province = "",
  ward = "",
  onChange,
  ariaLabel = "Chọn trường THPT",
  isDisabled = false,
  className,
}: SchoolComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const {
    data: schools = [],
    isError,
    isLoading,
  } = useSchoolDirectoryQuery(
    deferredQuery,
    { province, ward },
    isOpen && Boolean(province && ward) && !isDisabled,
  );

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === value || school.name === value),
    [schools, value],
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery("");
  };

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === undefined) return;

    const school = schools.find((item) => item.id === String(selectedKey));
    if (!school) return;

    onChange(school.id);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        appearance="outline"
        aria-label={ariaLabel}
        className={cn(
          "mt-1.5 h-9 w-full justify-between border-card-border bg-background-white-secondary px-3 py-2 text-left text-sm font-normal shadow-xs",
          className,
        )}
        isDisabled={isDisabled}
        type="button"
      >
        <span className="min-w-0 truncate">
          {selectedSchool?.name || value || "Chọn trường THPT"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-tertiary" />
      </Button>
      <Popover
        placement="bottom start"
        className="w-(--trigger-width) overflow-hidden rounded-xl border border-card-border bg-background-white-secondary shadow-lg"
      >
        <div className="border-b border-card-border p-1.5">
          <InputGroup className="h-8 rounded-md">
            <InputGroupAddon className="px-2 text-text-tertiary">
              <Search1 size={14} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              aria-label="Tìm trường THPT"
              className="h-8 py-1 text-xs"
              placeholder="Tìm theo tên, tỉnh hoặc mã trường…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </div>
        <ListBox
          aria-label="Danh sách trường THPT"
          className="max-h-64 overflow-y-auto p-1.5 outline-none"
          items={schools}
          selectedKeys={
            selectedSchool ? new Set([selectedSchool.id]) : new Set()
          }
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
        >
          {(school) => <SchoolOption school={school} />}
        </ListBox>
        {isLoading && (
          <p
            className="px-3 py-4 text-center text-sm text-text-tertiary"
            role="status"
          >
            Đang tải danh sách trường…
          </p>
        )}
        {!isLoading && isError && (
          <p
            className="px-3 py-4 text-center text-sm text-error-500"
            role="alert"
          >
            Chưa thể tải danh sách trường.
          </p>
        )}
        {!isLoading && !isError && schools.length === 0 && (
          <p
            className="px-3 py-4 text-center text-sm text-text-tertiary"
            role="status"
          >
            Không tìm thấy trường phù hợp.
          </p>
        )}
      </Popover>
    </DialogTrigger>
  );
}

function SchoolOption({ school }: { school: SchoolDirectoryRecord }) {
  return (
    <ListBoxItem
      id={school.id}
      textValue={`${school.name} ${school.district} ${school.province} ${school.schoolCode}`}
      className="group/item relative flex w-full cursor-pointer items-center rounded-lg py-2 pr-8 pl-2 text-sm text-text-secondary outline-hidden select-none focus:bg-background-gray-secondary_alt"
    >
      {({ isSelected }) => (
        <>
          <span className="min-w-0">
            <span className="block truncate font-medium text-text-primary">
              {school.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-text-tertiary">
              {[school.district, school.province].filter(Boolean).join(" · ")} ·
              Mã {school.schoolCode}
            </span>
          </span>
          {isSelected && (
            <span className="absolute right-2 flex size-5 items-center justify-center text-primary-500">
              <Check className="size-4" aria-hidden="true" />
            </span>
          )}
        </>
      )}
    </ListBoxItem>
  );
}
