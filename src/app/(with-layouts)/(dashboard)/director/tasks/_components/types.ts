import type { StudentListItem, StudentTaskItem } from "@/services/api/students/types";

export type TaskView = "all" | "today" | "overdue" | "upcoming";
export type TaskSort = "due-asc" | "due-desc" | "priority" | "student";
export type TaskStatusFilter = "all" | StudentTaskItem["status"];
export type TaskPriorityFilter = "all" | StudentTaskItem["priority"];
export type TaskTypeFilter = "all" | NonNullable<StudentTaskItem["taskType"]>;

export interface TaskCreatePayload extends StudentTaskItem {
  student: StudentListItem;
}
