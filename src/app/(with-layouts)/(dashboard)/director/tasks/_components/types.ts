import type {
  StudentListItem,
  StudentTaskItem,
} from "@/services/api/students/types";

export type TaskView = "all" | "today" | "overdue" | "upcoming";
export type TaskStatusFilter = "all" | StudentTaskItem["status"];
export type TaskLayout = "kanban" | "table";

export interface TaskLanePagination {
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export interface TaskCreatePayload extends StudentTaskItem {
  student: StudentListItem;
}
