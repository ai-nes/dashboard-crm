"use client";

import { Toggle } from "@/components/tailgrids/core/toggle";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger } from "@/components/tailgrids/core/select";
import type { ActionTimeSlot } from "@/services/api/nba-actions";

import {
  ACTION_TIME_SLOT_LABELS,
  ACTION_TIME_SLOTS,
} from "./types";

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
    <div className="space-y-2.5">
      <div className="flex flex-col gap-1.5 rounded-lg border border-card-border bg-background-gray-primary px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-text-primary">Cho phép gợi ý cả ngày</p>
          <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">Tắt để chọn các khung giờ cụ thể.</p>
        </div>
        <Toggle
          size="sm"
          label={isUnlimited ? "Đang bật" : "Đang tắt"}
          checked={isUnlimited}
          disabled={disabled || isSaving}
          onChange={(event) => onUnlimitedChange(event.target.checked)}
        />
      </div>

      <label className="space-y-1">
        <span className="text-xs font-medium text-input-label-text">Giới hạn theo khung giờ</span>
        <Select
          selectionMode="multiple"
          value={selectedSlots}
          onChange={(value) => {
            const nextSlots = Array.isArray(value) ? value.filter((item): item is ActionTimeSlot => availableTimeSlots.includes(item as ActionTimeSlot)) : [];
            onSlotsChange(nextSlots);
          }}
          isDisabled={disabled || isSaving || isUnlimited}
          aria-label="Giới hạn theo khung giờ"
        >
        <SelectTrigger size="sm" className="h-auto min-h-8.5 w-full flex-wrap justify-between gap-1 pr-2.5 pl-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {isUnlimited ? <span className="text-sm text-text-tertiary">Không giới hạn giờ</span> : selectedSlots.length === 0 ? <span className="text-sm text-text-tertiary">Chọn khung giờ</span> : selectedSlots.map((slot) => <span key={slot} className="rounded-md bg-badge-primary-background px-1.5 py-0.5 text-xs font-medium text-text-primary">{ACTION_TIME_SLOT_LABELS[slot]}</span>)}
            </div>
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent className="min-w-(--trigger-width)">
            {availableTimeSlots.map((slot) => <SelectItem key={slot} id={slot} textValue={ACTION_TIME_SLOT_LABELS[slot]}>{ACTION_TIME_SLOT_LABELS[slot]}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>

      <div className="flex items-center justify-between gap-3 border-t border-card-border pt-2.5 text-xs">
        <p className="leading-5 text-text-secondary">
          {isUnlimited ? "Hành động này có thể được gợi ý cả ngày." : isAllDay ? "Đã chọn đủ 4 khung giờ trong ngày." : `Đã chọn ${allowedTimeSlots.length}/${availableTimeSlots.length} khung giờ.`}
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
