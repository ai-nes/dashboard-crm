"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Toggle } from "@/components/tailgrids/core/toggle";
import type { ActionTimeSlot } from "@/services/api/nba-actions";

import {
  ACTION_TIME_SLOT_HINTS,
  ACTION_TIME_SLOT_LABELS,
  ACTION_TIME_SLOTS,
} from "./types";

interface NbaTimeWindowEditorProps {
  availableTimeSlots: ActionTimeSlot[];
  allowedTimeSlots: ActionTimeSlot[];
  disabled?: boolean;
  isSaving?: boolean;
  onUnlimitedChange: (isUnlimited: boolean) => void;
  onSlotChange: (slot: ActionTimeSlot, isSelected: boolean) => void;
}

export default function NbaTimeWindowEditor({
  availableTimeSlots,
  allowedTimeSlots,
  disabled = false,
  isSaving = false,
  onUnlimitedChange,
  onSlotChange,
}: NbaTimeWindowEditorProps) {
  const isUnlimited = allowedTimeSlots.length === 0;
  const isAllDay =
    availableTimeSlots.length === ACTION_TIME_SLOTS.length &&
    availableTimeSlots.every((slot) => allowedTimeSlots.includes(slot));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-card-border bg-background-gray-primary p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">Không giới hạn giờ</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Cho phép AI đề xuất Action ở mọi thời điểm.
          </p>
        </div>
        <Toggle
          size="md"
          label={isUnlimited ? "Đang bật" : "Đang tắt"}
          checked={isUnlimited}
          disabled={disabled || isSaving}
          onChange={(event) => onUnlimitedChange(event.target.checked)}
        />
      </div>

      <fieldset disabled={disabled || isSaving || isUnlimited}>
        <legend className="mb-2 text-sm font-medium text-text-primary">
          Khung giờ được phép
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {availableTimeSlots.map((slot) => {
            const isSelected = allowedTimeSlots.includes(slot);
            const isLastSelected = isSelected && allowedTimeSlots.length === 1;

            return (
              <Checkbox
                key={slot}
                size="md"
                isSelected={isSelected}
                isDisabled={isLastSelected}
                onChange={(selected) => onSlotChange(slot, selected)}
                className="w-full rounded-lg border border-card-border bg-button-primary-outline-background px-3 py-3 transition data-[selected=true]:border-primary-500/60 data-[selected=true]:bg-badge-primary-background hover:border-border-secondary-alt"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text-primary">
                    {ACTION_TIME_SLOT_LABELS[slot]}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-tertiary">
                    {ACTION_TIME_SLOT_HINTS[slot]}
                  </span>
                </span>
              </Checkbox>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="leading-5 text-text-secondary">
          {isUnlimited
            ? "Đang áp dụng cho cả ngày, không giới hạn khung giờ."
            : isAllDay
              ? "Đang chọn đủ 4 khung giờ trong ngày."
              : `Đang chọn ${allowedTimeSlots.length}/${availableTimeSlots.length} khung giờ.`}
        </p>
        {isSaving && (
          <span className="shrink-0 text-primary-500" role="status">
            Đang lưu…
          </span>
        )}
      </div>
    </div>
  );
}
