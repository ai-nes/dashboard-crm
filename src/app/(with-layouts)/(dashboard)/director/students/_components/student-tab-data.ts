import type {
  StudentTaskItem,
} from "@/services/api/students/types";

/**
 * No live API for student touchpoint history / documents / follow-up tasks
 * yet — keep these empty so the tabs/cards render their standard empty
 * state instead of fabricated rows.
 */
export const touchpoints: {
  date: string;
  channel: string;
  title: string;
  detail: string;
  tone: "success" | "primary" | "warning";
}[] = [];

export const documents: {
  name: string;
  type: string;
  status: string;
  tone: "success" | "warning" | "gray";
  date: string;
}[] = [];

export const tasks: StudentTaskItem[] = [];
