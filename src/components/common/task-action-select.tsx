"use client";

import { DropdownField } from "@/components/common/dropdown-field";
import { Label } from "@/components/tailgrids/core/label";
import { TASK_ACTION_OPTIONS } from "@/services/api/tasks/action-catalog";

interface TaskActionSelectProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  hideLabel?: boolean;
}

export function TaskActionSelect({
  value,
  onChange,
  isDisabled = false,
  hideLabel = false,
}: TaskActionSelectProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {!hideLabel && <Label>Loại task *</Label>}
      <DropdownField
        ariaLabel="Chọn loại task"
        contentClassName="w-[min(360px,calc(100vw-2rem))] min-w-0 max-w-[calc(100vw-2rem)]"
        emptyMessage="Không tìm thấy loại task phù hợp."
        isDisabled={isDisabled}
        isSearchable
        onChange={(nextValue) => {
          if (nextValue) onChange(nextValue);
        }}
        options={TASK_ACTION_OPTIONS.map((option) => ({
          id: option.code,
          label: option.displayName,
          description: option.categoryLabel,
          searchText: `${option.displayName} ${option.categoryLabel} ${option.description}`,
        }))}
        placeholder="Chọn loại task"
        renderOption={(option) => (
          <span className="flex min-w-0 flex-col">
            <span className="block min-w-0 whitespace-normal break-words font-medium text-text-primary">
              {option.label}
            </span>
            <span className="mt-0.5 block min-w-0 whitespace-normal break-words text-xs text-text-tertiary">
              {option.description}
            </span>
          </span>
        )}
        searchPlaceholder="Tìm theo tên..."
        triggerClassName="h-auto min-h-9 border-card-border bg-card-background pr-2.5 pl-3 text-left text-sm font-medium shadow-xs [&>span:first-child]:whitespace-normal [&>span:first-child]:break-words"
        value={value}
      />
    </div>
  );
}
