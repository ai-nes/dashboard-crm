import type { StudentTaskItem } from "@/services/api/students/types";

export interface TaskManagementItem extends StudentTaskItem {
  ownerId?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentInitials: string;
  studentMajor: string;
}
