import { formatDate } from "@/utils/format-date";

export type ActivityTimeFilter =
  | "all"
  | "today"
  | "yesterday"
  | "this-week"
  | "last-week"
  | "last-7-days";

export const activityTimeFilterOptions: { id: ActivityTimeFilter; label: string }[] = [
  { id: "all", label: "Tất cả thời gian" },
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "this-week", label: "Tuần này" },
  { id: "last-week", label: "Tuần trước" },
  { id: "last-7-days", label: "7 ngày qua" },
];

export interface StudentActivityGroup<T> {
  id: string;
  label: string;
  items: T[];
  sortTime: number;
}

export function parseStudentActivityDate(value?: string): Date {
  if (!value) return new Date(0);

  const vnMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*·\s*(\d{1,2}):(\d{2}))?/);
  if (vnMatch) {
    const [, day, month, year, hour = "0", minute = "0"] = vnMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const result = startOfDay(date);
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

export function matchesActivityTimeFilter(
  value: string,
  filter: ActivityTimeFilter,
): boolean {
  if (filter === "all") return true;

  const activityDate = parseStudentActivityDate(value);
  if (activityDate.getTime() === 0) return false;

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (filter === "today") return activityDate.getTime() === today.getTime();

  if (filter === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return activityDate.getTime() === yesterday.getTime();
  }

  if (filter === "this-week") {
    const weekStart = startOfWeek(today);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return activityDate >= weekStart && activityDate < nextWeekStart;
  }

  if (filter === "last-week") {
    const thisWeekStart = startOfWeek(today);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    return activityDate >= lastWeekStart && activityDate < thisWeekStart;
  }

  const lastSevenDaysStart = new Date(today);
  lastSevenDaysStart.setDate(lastSevenDaysStart.getDate() - 6);
  return activityDate >= lastSevenDaysStart && activityDate < tomorrow;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getDateGroupLabel(date: Date): string {
  const today = startOfDay(new Date());
  const activityDay = startOfDay(date);
  const daysFromToday = Math.round((today.getTime() - activityDay.getTime()) / 86_400_000);

  if (daysFromToday === 0) return "Hôm nay";
  if (daysFromToday === 1) return "Hôm qua";
  return formatDate(date);
}

function groupActivityItems<T>(
  items: T[],
  getDate: (item: T) => Date,
  isOverdue: (item: T) => boolean,
): StudentActivityGroup<T>[] {
  const groups = new Map<string, StudentActivityGroup<T>>();

  for (const item of items) {
    const date = getDate(item);
    const overdue = isOverdue(item);
    const validDate = date.getTime() > 0;
    const id = overdue ? "overdue" : validDate ? dateKey(date) : "unknown";
    const existing = groups.get(id);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(id, {
        id,
        label: overdue ? "Quá hạn" : validDate ? getDateGroupLabel(date) : "Chưa xác định thời gian",
        items: [item],
        sortTime: overdue
          ? Number.MAX_SAFE_INTEGER
          : validDate
            ? date.getTime()
            : Number.MIN_SAFE_INTEGER,
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.sortTime - a.sortTime);
}

export function groupActivitiesByDate<T>(
  items: T[],
  getDate: (item: T) => Date,
): StudentActivityGroup<T>[] {
  return groupActivityItems(items, getDate, () => false);
}

export function groupActivitiesWithOverdue<T>(
  items: T[],
  getDate: (item: T) => Date,
  isOverdue: (item: T) => boolean,
): StudentActivityGroup<T>[] {
  return groupActivityItems(items, getDate, isOverdue);
}
