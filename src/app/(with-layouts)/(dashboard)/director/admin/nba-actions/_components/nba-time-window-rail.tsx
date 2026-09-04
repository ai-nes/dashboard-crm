import type { ActionTimeSlot } from "@/services/api/nba-actions";

import { ACTION_TIME_SLOT_LABELS } from "./types";

interface NbaTimeWindowRailProps {
  availableTimeSlots: ActionTimeSlot[];
  allowedTimeSlots: ActionTimeSlot[];
}

export default function NbaTimeWindowRail({
  availableTimeSlots,
  allowedTimeSlots,
}: NbaTimeWindowRailProps) {
  const isUnlimited = allowedTimeSlots.length === 0;
  const summary = isUnlimited
    ? "Không giới hạn giờ"
    : `${allowedTimeSlots.length}/${availableTimeSlots.length} khung giờ đang chọn`;

  return (
    <div
      className="grid grid-cols-2 overflow-hidden rounded-lg border border-card-border divide-x divide-y divide-card-border sm:grid-cols-4 sm:divide-y-0"
      role="group"
      aria-label={`Tóm tắt chính sách thời gian: ${summary}`}
    >
      {availableTimeSlots.map((slot) => {
        const isAllowed = isUnlimited || allowedTimeSlots.includes(slot);

        return (
          <div
            key={slot}
            aria-label={`${ACTION_TIME_SLOT_LABELS[slot]}: ${isAllowed ? "AI có thể gợi ý" : "AI không gợi ý"}`}
            className={
              isAllowed
                ? "flex min-h-16 w-full flex-col justify-center rounded-none bg-badge-primary-background px-3 py-2.5 text-left"
                : "flex min-h-16 w-full flex-col justify-center rounded-none bg-background-gray-primary px-3 py-2.5 text-left"
            }
          >
            <span className="block text-xs font-semibold text-text-primary">
              {ACTION_TIME_SLOT_LABELS[slot]}
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary">
              <span
                className={isAllowed ? "size-1.5 rounded-full bg-primary-500" : "size-1.5 rounded-full bg-text-tertiary"}
                aria-hidden="true"
              />
              <span className="sr-only">
                {isAllowed ? "AI có thể gợi ý" : "AI không gợi ý"}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
