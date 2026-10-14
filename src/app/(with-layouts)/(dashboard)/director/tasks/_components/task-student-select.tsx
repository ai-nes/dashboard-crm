"use client";

import { DropdownField } from "@/components/common/dropdown-field";
import { Label } from "@/components/tailgrids/core/label";
import type { ScrollToLoadMoreOptions } from "@/hooks/use-scroll-to-load-more";
import type { StudentListItem } from "@/services/api/students/types";

interface TaskStudentSelectProps {
  students: StudentListItem[];
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  pagination?: ScrollToLoadMoreOptions;
  placeholder?: string;
  hideLabel?: boolean;
}

function getStudentPlaceholder(
  students: StudentListItem[],
  isLoading: boolean,
  placeholder?: string,
): string {
  if (isLoading) return "Đang tải danh sách học sinh...";
  if (placeholder) return placeholder;
  return students.length > 0 ? "Chọn học sinh" : "Không có học sinh phù hợp";
}

export default function TaskStudentSelect({
  students,
  value,
  onChange,
  isDisabled,
  isLoading = false,
  isError = false,
  pagination,
  placeholder: placeholderText,
  hideLabel = false,
}: TaskStudentSelectProps) {
  const placeholder = getStudentPlaceholder(
    students,
    isLoading,
    placeholderText,
  );

  return (
    <div className="flex w-full flex-col gap-2">
      {!hideLabel && <Label>Học sinh *</Label>}
      <DropdownField
        ariaLabel="Chọn học sinh liên kết với task"
        contentClassName="min-w-[340px] max-w-[calc(100vw-2rem)] sm:min-w-[380px]"
        filterOptions={false}
        isDisabled={isLoading || isDisabled}
        isError={isError}
        errorMessage="Không thể tải danh sách học sinh."
        isLoading={isLoading}
        isSearchable
        pagination={pagination}
        resetSearchOnClose={false}
        searchPlaceholder="Tìm theo tên hoặc mã học sinh..."
        onChange={(nextValue) => {
          if (nextValue) onChange(nextValue);
        }}
        options={students.map((student) => ({
          id: student.id,
          label: `${student.name} · ${student.code.trim() || "Chưa có mã học sinh"}`,
          description: student.major,
          searchText: `${student.name} ${student.code} ${student.major}`,
        }))}
        placeholder={placeholder}
        triggerClassName="border-card-border bg-card-background text-sm font-medium shadow-xs"
        value={value}
      />
    </div>
  );
}
