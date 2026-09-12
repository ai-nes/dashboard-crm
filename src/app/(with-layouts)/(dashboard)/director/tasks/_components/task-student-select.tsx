"use client";

import { DropdownField } from "@/components/common/dropdown-field";
import { Label } from "@/components/tailgrids/core/label";
import type { StudentListItem } from "@/services/api/students/types";

interface TaskStudentSelectProps {
  students: StudentListItem[];
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  hideLabel?: boolean;
}

const SEARCH_THRESHOLD = 8;

function getStudentPlaceholder(
  students: StudentListItem[],
  isLoading: boolean,
): string {
  if (isLoading) return "Đang tải danh sách học sinh...";
  return students.length > 0 ? "Chọn học sinh" : "Chưa có học sinh";
}

export default function TaskStudentSelect({
  students,
  value,
  onChange,
  isDisabled,
  isLoading = false,
  hideLabel = false,
}: TaskStudentSelectProps) {
  const placeholder = getStudentPlaceholder(students, isLoading);

  return (
    <div className="flex w-full flex-col gap-2">
      {!hideLabel && <Label>Học sinh *</Label>}
      <DropdownField
        ariaLabel="Chọn học sinh liên kết với task"
        contentClassName="min-w-[340px] max-w-[calc(100vw-2rem)] sm:min-w-[380px]"
        isDisabled={isLoading || students.length === 0 || isDisabled}
        isLoading={isLoading}
        isSearchable={students.length > SEARCH_THRESHOLD}
        onChange={(nextValue) => {
          if (nextValue) onChange(nextValue);
        }}
        options={students.map((student) => ({
          id: student.id,
          label: student.name,
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
