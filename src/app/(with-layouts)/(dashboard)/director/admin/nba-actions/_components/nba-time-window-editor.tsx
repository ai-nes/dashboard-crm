"use client";

import { Toggle } from "@/components/tailgrids/core/toggle";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
} from "@/components/tailgrids/core/select";
import type { ActionTimeSlot } from "@/services/api/nba-actions";

import { ACTION_TIME_SLOT_LABELS, ACTION_TIME_SLOTS } from "./types";

interface NbaTimeWindowEditorProps {
  availableTimeSlots: ActionTimeSlot[];
  allowedTimeSlots: ActionTimeSlot[];
  disabled?: boolean;
  isSaving?: boolean;
  onUnlimitedChange: (isUnlimited: boolean) => void;
  onSlotsChange: (slots: ActionTimeSlot[]) => void;
}

export default function NbaTimeWindowEditor({
  availableTimeSlots,
  allowedTimeSlots,
  disabled = false,
  isSaving = false,
  onUnlimitedChange,
  onSlotsChange,
}: NbaTimeWindowEditorProps) {
  const isUnlimited = allowedTimeSlots.length === 0;
  const isAllDay =
    availableTimeSlots.length === ACTION_TIME_SLOTS.length &&
    availableTimeSlots.every((slot) => allowedTimeSlots.includes(slot));
  const selectedSlots = isUnlimited ? [] : allowedTimeSlots;

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">
            Cho phép gợi ý cả ngày
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Tắt để chọn các khung giờ cụ thể.
          </p>
        </div>
        <Toggle
          size="md"
          aria-label="Cho phép gợi ý cả ngày"
          checked={isUnlimited}
          disabled={disabled || isSaving}
          onChange={(event) => onUnlimitedChange(event.target.checked)}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs font-medium text-input-label-text">
          Giới hạn theo khung giờ
        </span>
        <Select
          selectionMode="multiple"
          value={selectedSlots}
          onChange={(value) => {
            const nextSlots = Array.isArray(value)
              ? value.filter((item): item is ActionTimeSlot =>
                  availableTimeSlots.includes(item as ActionTimeSlot),
                )
              : [];
            onSlotsChange(nextSlots);
          }}
          isDisabled={disabled || isSaving || isUnlimited}
          aria-label="Giới hạn theo khung giờ"
        >
          <SelectTrigger
            size="sm"
            aria-label="Giới hạn theo khung giờ"
            className="h-auto min-h-11 w-full flex-wrap justify-between gap-2 rounded-xl px-3 py-2 md:min-h-10"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {isUnlimited ? (
                <span className="text-sm text-text-secondary">
                  Không giới hạn giờ
                </span>
              ) : selectedSlots.length === 0 ? (
                <span className="text-sm text-text-tertiary">
                  Chọn khung giờ
                </span>
              ) : (
                selectedSlots.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-md bg-background-gray-secondary px-2 py-1 text-xs font-medium text-text-secondary"
                  >
                    {ACTION_TIME_SLOT_LABELS[slot]}
                  </span>
                ))
              )}
            </div>
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent className="min-w-(--trigger-width)">
            {availableTimeSlots.map((slot) => (
              <SelectItem
                key={slot}
                id={slot}
                textValue={ACTION_TIME_SLOT_LABELS[slot]}
              >
                {ACTION_TIME_SLOT_LABELS[slot]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(!isUnlimited || isSaving) && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <p className="leading-5 text-text-secondary">
            {isUnlimited
              ? "Hành động này có thể được gợi ý cả ngày."
              : isAllDay
                ? "Đã chọn đủ 4 khung giờ trong ngày."
                : `Đã chọn ${allowedTimeSlots.length}/${availableTimeSlots.length} khung giờ.`}
          </p>
          {isSaving && (
            <span className="shrink-0 text-primary-500" role="status">
              Đang lưu…
            </span>
          )}
        </div>
      )}
    </div>
  );
}
