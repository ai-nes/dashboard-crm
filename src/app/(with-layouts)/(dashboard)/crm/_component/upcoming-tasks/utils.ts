import type { UpcomingTasksRawResponse } from "@/services/api/crm";
import type { DayColumnViewModel } from "./types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildWeekColumns(response: UpcomingTasksRawResponse): DayColumnViewModel[] {
  const weekStart = new Date(response.week_start);
  const today = new Date();

  return DAY_LABELS.map((dayLabel, dayOfWeek) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayOfWeek);

    const tasks = response.data
      .filter((item) => item.day_of_week === dayOfWeek)
      .map((item) => ({
        id: item.id,
        title: item.title,
        timeLabel: item.time_label,
        type: item.type,
      }));

    return {
      dayOfWeek,
      dayLabel,
      dateLabel: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isToday: date.toDateString() === today.toDateString(),
      tasks,
    };
  });
}
