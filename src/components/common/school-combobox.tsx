"use client";

import { useDeferredValue, useMemo, useState } from "react";

import {
  DropdownField,
  type DropdownOption,
} from "@/components/common/dropdown-field";
import { useSchoolDirectoryQuery } from "@/hooks/use-school-directory-query";

interface SchoolComboboxProps {
  value: string;
  selectedSchoolLabel?: string;
  province?: string;
  ward?: string;
  requiresWard?: boolean;
  onChange: (value: string) => void;
  ariaLabel?: string;
  isDisabled?: boolean;
  className?: string;
}

export function SchoolCombobox({
  value,
  selectedSchoolLabel,
  province = "",
  ward = "",
  requiresWard = true,
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
    isOpen && Boolean(province && (requiresWard ? ward : true)) && !isDisabled,
  );

  const selectedSchool = useMemo(
    () =>
      schools.find((school) => school.id === value || school.name === value),
    [schools, value],
  );
  const schoolOptions = useMemo<DropdownOption[]>(
    () =>
      schools.map((school) => ({
        id: school.id,
        label: school.name,
        description: [school.district, school.province]
          .filter(Boolean)
          .join(" · ")
          .concat(` · Mã ${school.schoolCode}`),
        searchText: `${school.name} ${school.district} ${school.province} ${school.schoolCode}`,
      })),
    [schools],
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery("");
  };

  const handleSelectionChange = (selectedKey: string | null) => {
    const school = schools.find((item) => item.id === selectedKey);
    if (!school) return;

    onChange(school.id);
  };

  return (
    <DropdownField
      ariaLabel={ariaLabel}
      contentClassName="max-w-[calc(100vw-2rem)]"
      emptyMessage="Không tìm thấy trường phù hợp."
      errorMessage="Chưa thể tải danh sách trường."
      filterOptions={false}
      isDisabled={isDisabled}
      isError={isError}
      isLoading={isLoading}
      isOpen={isOpen}
      isSearchable
      loadingMessage="Đang tải danh sách trường…"
      onChange={handleSelectionChange}
      onOpenChange={handleOpenChange}
      onSearchChange={setQuery}
      options={schoolOptions}
      placeholder="Chọn trường THPT"
      searchPlaceholder="Tìm theo tên, tỉnh hoặc mã trường…"
      selectedLabel={selectedSchoolLabel || value || undefined}
      triggerClassName={className}
      value={selectedSchool?.id || value}
    />
  );
}
