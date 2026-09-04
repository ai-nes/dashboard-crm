import {
  ACTION_TIME_SLOTS,
  type ActionTimeSlot,
  type NbaAction,
} from "@/services/api/nba-actions";

export { ACTION_TIME_SLOTS };

export const NBA_ACTION_PAGE_SIZE = 5;

export const ACTION_TIME_SLOT_LABELS: Record<ActionTimeSlot, string> = {
  "0-6": "00:00–06:00",
  "6-12": "06:00–12:00",
  "12-18": "12:00–18:00",
  "18-24": "18:00–24:00",
};

export const ACTION_TIME_SLOT_HINTS: Record<ActionTimeSlot, string> = {
  "0-6": "Sáng sớm",
  "6-12": "Buổi sáng",
  "12-18": "Buổi chiều",
  "18-24": "Buổi tối",
};

export type EnabledFilter = "all" | "enabled" | "disabled";
export type ChannelFilter = "all" | "NONE" | "CALL" | "EMAIL" | "MESSAGE";

export function getActionTimeWindowLabel(
  action: Pick<NbaAction, "allowedTimeSlots">,
): string {
  const slots = action.allowedTimeSlots;
  if (slots.length === 0) return "Không giới hạn giờ";
  if (slots.length === ACTION_TIME_SLOTS.length) return "Cả ngày";
  return slots.map((slot) => ACTION_TIME_SLOT_LABELS[slot]).join(" · ");
}

export function getActionPurpose(action: NbaAction): string {
  return action.purpose ?? action.description ?? "Chưa có mô tả cho hành động này.";
}
