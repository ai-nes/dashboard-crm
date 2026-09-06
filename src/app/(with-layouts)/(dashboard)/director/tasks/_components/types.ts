import type {
  StudentListItem,
  StudentTaskItem,
} from "@/services/api/students/types";

export type TaskView = "all" | "today" | "overdue" | "upcoming";

export interface TaskCreatePayload extends StudentTaskItem {
  student: StudentListItem;
}
