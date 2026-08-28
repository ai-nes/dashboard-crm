import type { TaskItemRawItem, TaskItemType } from "@/services/api/crm";

export type { TaskItemType };

export interface TaskItemViewModel {
  id: string;
  title: string;
  timeLabel: string;
  type: TaskItemType;
}

export interface DayColumnViewModel {
  dayOfWeek: number;
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
  tasks: TaskItemViewModel[];
}

export type { TaskItemRawItem };
